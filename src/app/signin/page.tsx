// src/app/signin/page.tsx
'use client';

import React, { useState } from 'react';
// Добавляем импорты для Google Sign-In
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // Для разделителя
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"; // Для уведомлений
import { Label } from '@/components/ui/label'; // Убедимся, что Label импортирован

// Иконка Google (простой SVG пример, можно заменить на более качественный)
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.53-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);


export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // Отдельное состояние для Google
  const router = useRouter();
  const { toast } = useToast(); // Используем toast

  // Обработчик входа через Email/Password (без изменений)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Неверный email или пароль.');
      } else {
        setError('Произошла ошибка при входе. Попробуйте снова.');
      }
      setLoading(false);
    }
  };

  // --- НОВЫЙ ОБРАБОТЧИК для Google Sign-In ---
  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider(); // Создаем провайдера Google
    try {
      await signInWithPopup(auth, provider); // Запускаем всплывающее окно
      router.push('/'); // Перенаправляем после успешного входа
      toast({ title: "Вход выполнен успешно!" });
    } catch (err: any) {
      console.error("Google Sign-in error: ", err);
      // Обработка распространенных ошибок
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Окно входа было закрыто. Попробуйте еще раз.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Можно игнорировать или показать общее сообщение
        setError('Запрос на вход был отменен.');
      } else if (err.code === 'auth/popup-blocked') {
         setError('Всплывающее окно заблокировано браузером. Пожалуйста, разрешите всплывающие окна для этого сайта.');
      }
       else {
        setError('Произошла ошибка при входе через Google.');
      }
      setGoogleLoading(false);
    }
    // setLoading не нужен, так как при успехе редирект
  };
  // --- Конец нового обработчика ---

  return (
    <div className="flex items-center justify-center min-h-screen bg-f0f8ff p-4" style={{ backgroundImage: 'url("/bg.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border border-border/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-a020f0">Вход</CardTitle>
          <CardDescription className="text-center">
            Войдите, чтобы сохранять свои истории.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Форма Email/Password */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required disabled={loading || googleLoading}
                className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
              />
            </div>
            <div className="space-y-2">
               <Label htmlFor="password">Пароль</Label>
              <Input
                id="password" type="password" placeholder="********"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required disabled={loading || googleLoading}
                 className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
              />
            </div>
            <Button type="submit" className="w-full bg-a020f0 hover:bg-purple-700" disabled={loading || googleLoading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
          </form>

          {/* Разделитель */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Или продолжить с
              </span>
            </div>
          </div>

          {/* --- НОВАЯ КНОПКА Google Sign-In --- */}
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading || googleLoading}>
             {googleLoading ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
                 <GoogleIcon />
             )}
             <span className="ml-2">Войти через Google</span>
          </Button>
           {/* --- Конец новой кнопки --- */}

           {/* Отображение общей ошибки */}
           {error && <p className="text-sm text-red-600 text-center pt-2">{error}</p>}

        </CardContent>
        <CardFooter className="text-center text-sm pt-4">
          Нет аккаунта?{' '}
          <Link href="/signup" className="underline text-a020f0 hover:text-purple-700">
            Зарегистрироваться
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}