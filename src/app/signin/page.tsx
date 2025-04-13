'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Перенаправляем на главную после успешного входа
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.code === 'auth/invalid-credential') {
        setError('Неверный email или пароль.');
      } else {
        setError('Произошла ошибка при входе. Попробуйте снова.');
      }
      setLoading(false);
    }
    // setLoading(false) не нужен здесь, т.к. происходит редирект в случае успеха
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-f0f8ff p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-a020f0">Вход</CardTitle>
          <CardDescription className="text-center">
            Введите ваши данные для входа.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
               <label htmlFor="password">Пароль</label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                 disabled={loading}
              />
            </div>
             {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <Button type="submit" className="w-full bg-a020f0 hover:bg-purple-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Нет аккаунта?{' '}
          <Link href="/signup" className="underline text-a020f0 hover:text-purple-700">
            Зарегистрироваться
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}