'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/firebaseConfig';
import { collection, query, where, orderBy, getDocs, Timestamp, deleteDoc, doc } from 'firebase/firestore'; // Добавили deleteDoc, doc
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Trash2 } from 'lucide-react'; // Добавили Trash2
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; // Добавили импорт Link
import { useToast } from '@/hooks/use-toast'; // Для уведомлений об удалении
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog" // Для подтверждения удаления

interface Story {
    id: string;
    partner1Name?: string; // Сделаем необязательными для гибкости
    partner2Name?: string;
    storyText: string;
    createdAt: any;
    genre?: string;
    yearsTogether?: number;
    // Добавьте другие поля, если они есть
}

export default function MyStoriesPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast(); // Инициализируем toast

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push('/signin');
      return;
    }

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
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleString('ru-RU') : 'N/A',
          } as Story;
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
  }, [currentUser, authLoading, router]);

  const handleDeleteStory = async (storyId: string) => {
      if (!currentUser) return; // Доп. проверка
      try {
          await deleteDoc(doc(db, "stories", storyId));
          setStories(prevStories => prevStories.filter(story => story.id !== storyId)); // Обновляем состояние локально
          toast({
              title: "История удалена",
              description: "Ваша история была успешно удалена.",
          });
      } catch (error) {
           console.error("Error deleting story: ", error);
           toast({
               title: "Ошибка удаления",
               description: "Не удалось удалить историю. Попробуйте снова.",
               variant: "destructive",
           });
      }
  };


  if (authLoading || (loadingStories && stories.length === 0)) { // Показываем загрузку дольше, если истории еще не пришли
    return (
      <div className="flex justify-center items-center min-h-screen bg-f0f8ff" style={{ backgroundImage: 'url("/bg.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        <Loader2 className="h-16 w-16 animate-spin text-a020f0" />
      </div>
    );
  }

  return (
     <div className="min-h-screen bg-f0f8ff py-8 px-4" style={{ backgroundImage: 'url("/bg.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <div className="container mx-auto">
          <Button variant="ghost" onClick={() => router.push('/')} className="mb-6 text-a020f0 hover:bg-purple-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к генератору
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-a020f0 title">Мои сохраненные истории</h1>

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          {!loadingStories && stories.length === 0 && !error && (
            <p className="text-center text-muted-foreground mt-10 text-lg">У вас пока нет сохраненных историй. Время создать первую!</p>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              // Обернули Card в Link
              <Link href={`/my-stories/${story.id}`} key={story.id} className="block group">
                <Card className="flex flex-col h-full bg-card/90 backdrop-blur-sm border border-border/30 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold group-hover:text-a020f0 transition-colors">
                      {story.partner1Name || 'Партнер 1'} & {story.partner2Name || 'Партнер 2'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Жанр: {story.genre || 'Неизвестный'} | Лет вместе: {story.yearsTogether ?? '?'}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow mb-2">
                     {/* Уменьшил line-clamp для компактности */}
                    <p className="text-sm line-clamp-4">{story.storyText}</p>
                  </CardContent>
                  <div className="border-t p-3 text-xs text-muted-foreground flex justify-between items-center">
                     <span>Сохранено: {story.createdAt}</span>
                      {/* Кнопка удаления */}
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              {/* Останавливаем всплытие события, чтобы клик не перешел на Link */}
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
                                  onClick={(e) => e.stopPropagation()} // Важно!
                              >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Удалить историю</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}> {/* Останавливаем всплытие и здесь */}
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Это действие необратимо. История будет удалена навсегда.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction
                                      onClick={() => handleDeleteStory(story.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                      Удалить
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
    </div>
  );
}