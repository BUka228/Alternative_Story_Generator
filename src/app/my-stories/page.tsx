// src/app/my-stories/page.tsx
'use client'; // Пока сделаем клиентским для простоты

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/firebaseConfig';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Story {
    id: string;
    partner1Name: string;
    partner2Name: string;
    storyText: string;
    createdAt: any; // Используйте any или более точный тип после преобразования
    genre: string;
    yearsTogether: number;
     // Добавьте другие поля, если они есть
}

export default function MyStoriesPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Если проверка аутентификации еще идет, ничего не делаем
    if (authLoading) {
      return;
    }

    // Если пользователь не аутентифицирован, перенаправляем на вход
    if (!currentUser) {
      router.push('/signin');
      return;
    }

    // Загружаем истории
    const fetchStories = async () => {
      setLoadingStories(true);
      setError(null);
      try {
        const storiesRef = collection(db, 'stories');
        const q = query(storiesRef, where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedStories = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Преобразуем Timestamp в читаемую строку или оставляем как есть для дальнейшей обработки
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleString('ru-RU') : 'N/A',
          } as Story; // Указываем тип
        });
        setStories(fetchedStories);
      } catch (err) {
        console.error("Error fetching stories:", err);
        setError("Не удалось загрузить истории.");
      } finally {
        setLoadingStories(false);
      }
    };

    fetchStories();
  }, [currentUser, authLoading, router]); // Зависимости эффекта

  // Общее состояние загрузки
  if (authLoading || loadingStories) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-a020f0" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к генератору
      </Button>
      <h1 className="text-3xl font-bold mb-6 text-center text-a020f0">Мои сохраненные истории</h1>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {stories.length === 0 && !error && (
        <p className="text-center text-muted-foreground">У вас пока нет сохраненных историй.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <Card key={story.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">
                История для {story.partner1Name || 'Партнер 1'} и {story.partner2Name || 'Партнер 2'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Жанр: {story.genre || 'Не указан'} | Лет вместе: {story.yearsTogether || '?'}
              </p>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm line-clamp-6">{story.storyText}</p> {/* Ограничим высоту текста */}
            </CardContent>
            <div className="border-t p-4 text-xs text-muted-foreground">
               Сохранено: {story.createdAt}
               {/* Можно добавить кнопку "Удалить" или "Поделиться" здесь */}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}