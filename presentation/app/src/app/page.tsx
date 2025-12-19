'use client'; 

import { useState } from "react";
import styles from "./page.module.css"; 
import { Unauthenticated, Authenticated, type User, type UserDTO } from "@/lib/api/api";

export default function Home() {
  const [user, setUser] = useState<User>(() => new Unauthenticated()); 
  const [dto, setDto] = useState<UserDTO | null>(null); 
  const [error, setError] = useState<string>(''); 

  const onCreate = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setError(''); 
    const form = new FormData(e.currentTarget); 
    
    let candidate: UserDTO = {
      id: -1, 
      name: String(form.get('name')), 
      email: String(form.get('email')), 
      password: String(form.get('password')), 
      createdAt: '', 
    } 
    
    try {
      const _dto = await user.create(candidate); 
      setDto(_dto); 
      setUser(new Authenticated()); 
    } catch(err) {
      setError(err instanceof Error ? err.message : 'error'); 
    }
  }

  const onSignIn = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setError(''); 
    const form = new FormData(e.currentTarget); 
    
    let candidate: UserDTO = {
      id: -1, 
      name: '', 
      email: String(form.get('email')), 
      password: String(form.get('password')), 
      createdAt: '', 
    } 
    
    try {
      const _dto = await user.signIn(candidate); 
      setDto(_dto); 
      setUser(new Authenticated()); 
    } catch(err) {
      setError(err instanceof Error ? err.message : 'error'); 
    }
  }

  const onSignOut = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setError(''); 
    
    if(dto === null) {
      setError('Not signed in but trying to sign out.'); 
      return; 
    }
    const _dto = await user.signOut(dto as UserDTO); 
    setDto(_dto); 
    setUser(new Unauthenticated()); 
  }

  const onDeleteAccount = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setError(''); 
    if(dto === null) {
      setError('Not signed in but trying to delete account.'); 
    }
    try {
      const success = user.delete(dto as UserDTO); 
      if(!success) {
        setError('unable to delete account'); 
        return; 
      }
      setDto(null); 
      setUser(new Unauthenticated()); 
    } catch(err) {
      setError(err instanceof Error ? err.message : 'error deleting user'); 
    }
  }
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles['account-cards']}>
          <div className={styles['account-card']}>
            <h2>Create Account</h2>
            <form onSubmit={onCreate}>
                <div>
                  <input type="text" name="name" placeholder="name" required /> 
                </div>
                <div>
                  <input type="text" name="email" placeholder="email" required /> 
                </div>
                <div>
                  <input type="text" name="password" placeholder="password" required /> 
                </div>
                <input type="submit" value="Submit" /> 
            </form>
          </div>
          <div className={styles['account-card']}>
            <h2>Sign In</h2>
            <form onSubmit={onSignIn}>
                <div>
                  <input type="text" name="email" placeholder="email" required /> 
                </div>
                <div>
                  <input type="text" name="password" placeholder="password" required /> 
                </div>
                <input type="submit" value="Submit" /> 
            </form>
          </div>
          <div className={styles['account-card']}>
            <h2>List All Users</h2>
            <form>
                <input type="submit" value="Submit" /> 
            </form>
          </div>
          <div className={styles['account-card']}>
            <h2>Sign Out</h2>
            <form onSubmit={onSignOut}>
                <input type="submit" value="Submit" /> 
            </form>
          </div>
          <div className={styles['account-card']}>
            <h2>Delete Account</h2>
            <form onSubmit={onDeleteAccount}>
                <input type="submit" value="Submit" /> 
            </form>
          </div>
        </div> 

        <div className={styles['user-state']}>
          <div>ID: {dto?.id ?? ''}</div>
          <div>Name: {dto?.name ?? ''}</div>
          <div>Email: {dto?.email ?? ''}</div>
          <div>Time Created: {dto?.createdAt ?? ''} </div>
          <div>Error: {error}</div>
        </div>
      </main>
      <footer className={styles.footer}>Sample Next.js/PHP/PostgreSQL app</footer> 
    </div>
  );
}