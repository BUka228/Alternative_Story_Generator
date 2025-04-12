'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error message

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // Optionally, redirect to a logged-in state or home page
      console.log('User signed in successfully');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    
      <h2>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignIn}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">Sign In</Button>
      </form>
    
  );
};

export default SignIn;
