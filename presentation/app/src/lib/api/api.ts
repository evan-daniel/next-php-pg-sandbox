type ApiResponse<T> = {
    status: number, 
    data: T; 
}

export async function apiCall<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(path, init); 
    const json = await res.json(); 
    return { status: res.status, ...json } as ApiResponse<T>; 
}

export type UserDTO = {
    id: number; 
    name: string; 
    email: string; 
    password: string; 
    createdAt: string; 
}

export interface User {
    create(user: UserDTO): Promise<UserDTO>; 
    signIn(user: UserDTO): Promise<UserDTO>; 
    listUsers(user: UserDTO): Promise<UserDTO[]>; 
    signOut(user: UserDTO): Promise<UserDTO>; 
    delete(user: UserDTO): Promise<boolean>; 
}

export class Unauthenticated implements User {
    async create(user: UserDTO): Promise<UserDTO> {
        const res: ApiResponse<UserDTO> = await apiCall<UserDTO>('http://localhost:8000/create-account', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(user), 
        }); 
        console.log(res); 
        if(res.status < 200 || 300 <= res.status) throw new Error('Failed to create account'); 
        return res.data; 
    }

    async signIn(user: UserDTO): Promise<UserDTO> {
        const res: ApiResponse<UserDTO> = await apiCall<UserDTO>('http://localhost:8000/sign-in', {
            method: 'POST', 
            body: JSON.stringify(user), 
        }); 
        if(res.status < 200 || 300 <= res.status) throw new Error('Failed to log in'); 
        return res.data; 
    }

    async listUsers(user: UserDTO): Promise<UserDTO[]> {
        throw new Error('Not allowed: must be signed in to list users.')
    }

    async signOut(user: UserDTO): Promise<UserDTO> {
        throw new Error('Not allowed: must be signed in to sign out.')
    }

    async delete(user: UserDTO): Promise<boolean> {
        throw new Error('Not allowed: must be signed in to delete user.')
    }
}

export class Authenticated implements User {
    async create(user: UserDTO): Promise<UserDTO> {
        throw new Error('Not allowed: you must sign out to create a new account.'); 
    }
    
    async signIn(user: UserDTO): Promise<UserDTO> {
        throw new Error('Not allowed: you must be signed out to sign in.'); 
    }

    async listUsers(user: UserDTO): Promise<UserDTO[]> {
        const res: ApiResponse<UserDTO[]> = await apiCall<UserDTO[]>('http://localhost:8000/list-users', {
            method: 'POST', 
            body: JSON.stringify(user), 
        }); 
        if(res.status < 200 || 300 <= res.status) throw new Error('Failed to get all users from backend'); 
        return res.data; 
    }

    async signOut(user: UserDTO): Promise<UserDTO> {
        return {id: -1, name: '', email: '', password: '', createdAt: ''} as UserDTO; 
    }

    async delete(user: UserDTO): Promise<boolean> {
        const res: ApiResponse<boolean> = await apiCall<boolean>('http://localhost:8000/delete-account', {
            method: 'POST', 
            body: JSON.stringify(user), 
        }); 
        if(res.status < 200 || 300 <= res.status) {
            throw new Error('Unable to delete user.'); 
        }
        return res.data; 
    }
}
