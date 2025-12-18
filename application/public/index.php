<?php 

header('Content-Type: application/json'); 

echo json_encode([
    'message' => 'PHP is for free.', 
    'time' => date('c'), 
]); 