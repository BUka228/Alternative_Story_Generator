// src/app/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth"; // Импортируем функцию для создания пользователя
import { auth } from "@/firebase/firebaseConfig"; // Импортируем наш экземпляр auth
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Иконка загрузки
import { Label } from '@/components/ui/label';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Добавим подтверждение пароля
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Сбрасываем ошибки

    // --- Проверка на совпадение паролей ---
    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }
    // --- Конец проверки ---

    setLoading(true);

    try {
      // Используем импортированную функцию и экземпляр auth
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up successfully');
      // Перенаправляем на главную страницу после успешной регистрации
      router.push('/');
      // Можно добавить toast уведомление об успехе, если нужно
    } catch (err: any) {
      console.error("Sign up error:", err.code, err.message); // Логируем код ошибки
      // Обрабатываем распространенные ошибки Firebase Auth
      if (err.code === 'auth/email-already-in-use') {
        setError('Этот email уже используется.');
      } else if (err.code === 'auth/weak-password') {
        setError('Пароль слишком слабый. Он должен содержать не менее 6 символов.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Некорректный формат email.');
      } else {
        setError('Произошла ошибка при регистрации. Попробуйте снова.');
      }
      setLoading(false); // Останавливаем загрузку в случае ошибки
    }
    // setLoading(false) здесь не нужен, т.к. при успехе происходит редирект
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-f0f8ff p-4" style={{
      backgroundImage: 'url("/bg.jpg")', // Добавляем фон, как на главной
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border border-border/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-a020f0">Регистрация</CardTitle>
          <CardDescription className="text-center">
            Создайте аккаунт, чтобы сохранять свои истории.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Поле Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
              />
            </div>
            {/* Поле Пароль */}
            <div className="space-y-2">
              <Label htmlFor="password">Пароль (мин. 6 символов)</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6} // Минимальная длина для Firebase Auth по умолчанию
                disabled={loading}
                 className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
              />
            </div>
            {/* Поле Подтверждение Пароля */}
            <div className="space-y-2">
               <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                 minLength={6}
                 disabled={loading}
                 className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
              />
            </div>
             {/* Отображение ошибки */}
             {error && <p className="text-sm text-red-600 text-center pt-2">{error}</p>}
            {/* Кнопка отправки */}
            <Button type="submit" className="w-full bg-a020f0 hover:bg-purple-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Зарегистрироваться
            </Button>
          </form>
        </CardContent>
        {/* Ссылка на страницу входа */}
        <CardFooter className="text-center text-sm pt-4">
          Уже есть аккаунт?{' '}
          <Link href="/signin" className="underline text-a020f0 hover:text-purple-700">
            Войти
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}