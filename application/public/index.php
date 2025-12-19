<?php 

declare(strict_types=1); 

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8'); 

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH); 

switch($path) {
    case '/create-account': 
        create_account(); 
        break; 

    case '/sign-in': 
        sign_in(); 
        break; 

    case '/delete-account': 
        delete_account(); 
        break; 

    default: 
        http_response_code(404); 
        header('Content-Type: application/json'); 
        echo json_encode(['data' => null, 'error' => 'Not found']); 
        exit; 
} 

function db(): PDO {
    $dsn = "pgsql:host=db;port=5432;dbname=sandbox"; 
    $pdo = new PDO($dsn, "sandbox", "sandbox", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, 
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]); 
    return $pdo; 
}

function json_ok(int $status, array $data): void {
    http_response_code($status); 
    echo json_encode(['data' => $data]); 
    exit; 
}

function json_err(int $status, string $message): void {
    http_response_code($status); 
    echo json_encode(['data' => null, 'error' => $message]); 
    exit; 
}

function create_account() {
    $input = json_decode(file_get_contents('php://input'), true); 
    if (!is_array($input)) {
        json_err(400, 'Invalid JSON');
    }
    
    $name = trim($input['name'] ?? ''); 
    $email = trim($input['email'] ?? ''); 
    $password = $input['password'] ?? ''; 

    if($name === '' || $email === '' || $password === '') {
        json_err(400, 'Missing required fields'); 
    }

    try {
        $pdo = db(); 
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password) 
            VALUES (:name, :email, :password) 
            RETURNING id, name, email, created_at 
        "); 
        $stmt->execute([
            ':name' => $name, 
            ':email' => $email, 
            ':password' => $password, 
        ]); 
        $row = $stmt->fetch(); 
        if(!$row) {
            json_err(500, 'No row returned'); 
        }

        json_ok(201, [
            'id' => (int)$row['id'], 
            'name' => $row['name'], 
            'email' => $row['email'], 
            'createdAt' => $row['created_at'], 
        ]); 
    } catch(PDOException $e) {
        json_err(500, $e->getMessage()); 
    }
}

function sign_in() {
    $input = json_decode(file_get_contents('php://input'), true); 
    if (!is_array($input)) {
        json_err(400, 'Invalid JSON');
    }
    
    $email = trim($input['email'] ?? ''); 
    $password = $input['password'] ?? ''; 

    if($email === '' || $password === '') {
        json_err(400, 'Missing required fields'); 
    }

    try {
        $pdo = db(); 
        $stmt = $pdo->prepare("
            SELECT * FROM users 
            WHERE EMAIL = :email 
            LIMIT 1
        "); 
        $stmt->execute([
            ':email' => $email, 
        ]); 
        $row = $stmt->fetch(); 
        if(!$row) {
            json_err(400, 'User does not exist'); 
        }

        if($password !== $row['password']) {
            json_err(400, 'Invalid passwd'); 
        } 

        json_ok(200, [
            'id' => (int)$row['id'], 
            'name' => $row['name'], 
            'email' => $row['email'], 
            'createdAt' => $row['created_at'], 
        ]); 
    } catch(PDOException $e) {
        json_err(500, $e->getMessage()); 
    }
}

function delete_account() {
    $input = json_decode(file_get_contents('php://input'), true); 
    if(!is_array($input)) {
        json_err(400, 'Invalid JSON'); 
    }

    $email = trim($input['email'] ?? ''); 
    if($email === '') {
        json_err(400, 'Email not provided.'); 
    }

    try {
        $pdo = db(); 
        $stmt = $pdo->prepare("
            DELETE FROM users 
            WHERE EMAIL = :email 
        "); 
        $stmt->execute([
            ':email' => $email, 
        ]); 
        $deleted = $stmt->rowCount(); 

        if($deleted === 0) {
            json_err(404, 'Invalid email'); 
        }

        http_response_code(200); 
        echo true; 
        exit; 
    } catch(PDOException $e) {
        json_err(500, $e->getMessage()); 
    }
}