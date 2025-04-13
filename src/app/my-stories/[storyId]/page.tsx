'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useParams для получения ID из URL
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc, Timestamp } from 'firebase/firestore'; // doc и getDoc для получения одного документа
import { Loader2, ArrowLeft, User, Calendar, Type, Star, Tag } from 'lucide-react'; // Иконки
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StoryDetail extends Story { // Расширяем базовый тип, если нужно
    // Дополнительные поля, если появятся
}

interface Story { // Повторим интерфейс для ясности или вынесем в общий файл
    id: string;
    partner1Name?: string;
    partner2Name?: string;
    storyText: string;
    createdAt: any;
    genre?: string;
    yearsTogether?: number;
    userId: string; // Поле userId теперь обязательно для проверки прав
    answers?: Record<string, string>; // Добавим ответы, если они сохраняются
    keywords?: { keyword1?: string, keyword2?: string }; // Добавим ключевые слова
}

export default function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>(); // Получаем ID из URL
  const { currentUser, loading: authLoading } = useAuth();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loadingStory, setLoadingStory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Ждем загрузки статуса аутентификации
    if (authLoading) return;

    // Если пользователя нет, или ID истории отсутствует, редирект или обработка ошибки
    if (!currentUser || !storyId) {
      router.push('/signin'); // Или на главную, или на my-stories
      return;
    }

    const fetchStory = async () => {
      setLoadingStory(true);
      setError(null);
      try {
        const storyRef = doc(db, "stories", storyId); // Создаем ссылку на конкретный документ
        const docSnap = await getDoc(storyRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // --- Проверка прав доступа ---
          if (data.userId !== currentUser.uid) {
             setError("У вас нет доступа к этой истории.");
             setStory(null);
          } else {
              setStory({
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleString('ru-RU') : 'N/A',
              } as StoryDetail);
          }
        } else {
          setError("История не найдена.");
          setStory(null);
        }
      } catch (err) {
        console.error("Error fetching story:", err);
        setError("Не удалось загрузить историю.");
        setStory(null);
      } finally {
        setLoadingStory(false);
      }
    };

    fetchStory();
  }, [storyId, currentUser, authLoading, router]); // Зависимости эффекта

  if (authLoading || loadingStory) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-f0f8ff" style={{ backgroundImage: 'url("/bg.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        <Loader2 className="h-16 w-16 animate-spin text-a020f0" />
      </div>
    );
  }

  return (
     <div className="min-h-screen bg-f0f8ff py-8 px-4" style={{ backgroundImage: 'url("/bg.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <div className="container mx-auto max-w-4xl"> {/* Ограничим ширину для удобства чтения */}
        <Button variant="ghost" onClick={() => router.push('/my-stories')} className="mb-6 text-a020f0 hover:bg-purple-100">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к списку историй
        </Button>

        {error && (
            <Card className="mb-6 bg-destructive/10 border-destructive">
                 <CardHeader>
                    <CardTitle className="text-destructive">{error}</CardTitle>
                 </CardHeader>
            </Card>
        )}

        {story && !error && (
          <Card className="bg-card/90 backdrop-blur-sm border border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-semibold text-a020f0 title text-center mb-2">
                История для {story.partner1Name || 'Партнер 1'} и {story.partner2Name || 'Партнер 2'}
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
                 <span className="flex items-center"><Calendar className="mr-1.5 h-4 w-4" /> {story.createdAt}</span>
                 {story.genre && <span className="flex items-center"><Type className="mr-1.5 h-4 w-4" /> {story.genre}</span>}
                 {story.yearsTogether !== undefined && <span className="flex items-center"><Star className="mr-1.5 h-4 w-4 text-yellow-500" /> {story.yearsTogether} лет вместе</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-8 py-6">
               {/* Отображение ключевых слов, если они есть */}
                {(story.keywords?.keyword1 || story.keywords?.keyword2) && (
                    <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                        <Tag className="h-4 w-4 inline-block"/> Ключевые слова:
                        {story.keywords.keyword1 && <span className="bg-secondary px-2 py-0.5 rounded">{story.keywords.keyword1}</span>}
                        {story.keywords.keyword2 && <span className="bg-secondary px-2 py-0.5 rounded">{story.keywords.keyword2}</span>}
                    </div>
                )}

              <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {story.storyText}
              </p>

               {/* Можно добавить отображение ответов на вопросы, если нужно */}
               {/*
               {story.answers && (
                   <div className="mt-6 border-t pt-4">
                       <h4 className="font-semibold mb-2">Ответы на НЕ-вопросы:</h4>
                       <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                           {Object.entries(story.answers).map(([key, value]) => value ? <li key={key}>{value}</li> : null)}
                       </ul>
                   </div>
               )}
               */}
            </CardContent>
             {/* Можно добавить футер с кнопками "Поделиться", "Удалить" здесь, если нужно */}
          </Card>
        )}
      </div>
    </div>
  );
}