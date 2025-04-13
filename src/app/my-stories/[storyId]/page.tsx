// src/app/my-stories/[storyId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/firebaseConfig';
import { doc, getDoc, Timestamp, deleteDoc } from 'firebase/firestore'; // Добавили deleteDoc
import { Loader2, ArrowLeft, User, Calendar, Type, Star, Tag, Trash2, Share2, Copy, Heart } from 'lucide-react'; // Добавили иконки
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator'; // Для визуального разделения
import { useToast } from '@/hooks/use-toast'; // Для уведомлений
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
} from "@/components/ui/alert-dialog"; // Для подтверждения удаления
import Link from 'next/link'; // Импортируем Link

// Интерфейс для истории (можно вынести в types.ts)
interface Story {
    id: string;
    partner1Name?: string;
    partner2Name?: string;
    storyText: string;
    createdAt: any; // Может быть Timestamp или строка после форматирования
    genre?: string;
    yearsTogether?: number;
    userId: string; // Обязательно для проверки прав
    answers?: Record<string, string>;
    keywords?: { keyword1?: string, keyword2?: string };
}

export default function StoryDetailPage() {
    const { storyId } = useParams<{ storyId: string }>();
    const { currentUser, loading: authLoading } = useAuth();
    const [story, setStory] = useState<Story | null>(null);
    const [loadingStory, setLoadingStory] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast(); // Инициализируем toast

    // --- Загрузка данных истории ---
    useEffect(() => {
        if (authLoading) return;
        if (!currentUser) {
            router.push('/signin');
            return;
        }
        if (!storyId) {
            setError("Неверный идентификатор истории.");
            setLoadingStory(false);
            return;
        }

        const fetchStory = async () => {
            setLoadingStory(true);
            setError(null);
            try {
                const storyRef = doc(db, "stories", storyId);
                const docSnap = await getDoc(storyRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.userId !== currentUser.uid) {
                        setError("У вас нет доступа к этой истории.");
                        setStory(null);
                    } else {
                        setStory({
                            id: docSnap.id,
                            ...data,
                            // Форматируем дату сразу при загрузке
                            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Неизвестно',
                        } as Story);
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
    }, [storyId, currentUser, authLoading, router]);

    // --- Обработчики действий ---
    const handleDelete = async () => {
        if (!story || !currentUser || story.userId !== currentUser.uid) return;

        try {
            await deleteDoc(doc(db, "stories", story.id));
            toast({
                title: "История удалена",
                description: "Ваша история была успешно удалена.",
            });
            router.push('/my-stories'); // Возвращаемся к списку после удаления
        } catch (error) {
            console.error("Error deleting story: ", error);
            toast({
                title: "Ошибка удаления",
                description: "Не удалось удалить историю.",
                variant: "destructive",
            });
        }
    };

    const copyToClipboard = () => {
        if (!story) return;
        const textToCopy = `История Наоборот для ${story.partner1Name || ''} и ${story.partner2Name || ''}:\n\n${story.storyText}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast({ title: "История скопирована!" });
        }).catch(err => {
            toast({ title: "Ошибка", description: "Не удалось скопировать.", variant: "destructive" });
            console.error("Failed to copy text: ", err);
        });
    };

    const shareStory = async () => {
        if (!story) return;
        const shareData = {
          title: `История Наоборот: ${story.partner1Name || ''} и ${story.partner2Name || ''}`,
          text: `Посмотрите нашу альтернативную историю знакомства!\n\n"${story.storyText}"\n\nСоздайте свою здесь: ${window.location.origin}`, // Ссылка на главную
          url: window.location.href, // Ссылка на текущую страницу истории
        };
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (error) {
             if (error instanceof Error && error.name !== 'AbortError') {
                console.error('Sharing failed:', error);
                 toast({ title: "Ошибка", description: "Не удалось поделиться.", variant: "destructive" });
            }
          }
        } else {
           // Нативный share не поддерживается, можно предложить копирование
           copyToClipboard();
           toast({title: "Скопировано", description: "API 'Поделиться' не поддерживается, история скопирована."});
        }
      };

    // --- Отображение состояний ---
    if (authLoading || loadingStory) {
        return (
          <div className="flex justify-center items-center min-h-screen bg-f0f8ff" style={{ backgroundImage: 'url("/bg.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            <Loader2 className="h-16 w-16 animate-spin text-a020f0" />
          </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                 <Button variant="ghost" onClick={() => router.push('/my-stories')} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    К списку историй
                 </Button>
                 <Card className="max-w-md mx-auto bg-destructive/10 border-destructive">
                     <CardHeader>
                        <CardTitle className="text-destructive text-xl">{error}</CardTitle>
                     </CardHeader>
                 </Card>
            </div>
        );
    }

    if (!story) {
        // Это состояние не должно возникать при правильной логике, но на всякий случай
         return (
            <div className="container mx-auto px-4 py-8 text-center">
                 <Button variant="ghost" onClick={() => router.push('/my-stories')} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    К списку историй
                 </Button>
                 <p>Историю не удалось загрузить.</p>
            </div>
         );
    }
    // --- Конец отображения состояний ---

    return (
        <div className="min-h-screen bg-f0f8ff py-8 px-4" style={{ backgroundImage: 'url("/bg.jpg")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            <div className="container mx-auto max-w-3xl"> {/* Сделал немного уже */}
                <Button variant="ghost" onClick={() => router.push('/my-stories')} className="mb-4 text-a020f0 hover:bg-purple-100">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    К списку историй
                </Button>

                <Card className="bg-card/90 backdrop-blur-sm border border-border/30 shadow-lg overflow-hidden">
                    <CardHeader className="bg-muted/30 p-6">
                        <CardTitle className="text-2xl md:text-3xl font-semibold text-a020f0 title text-center">
                            История для {story.partner1Name || '...'} и {story.partner2Name || '...'}
                        </CardTitle>
                        <CardDescription className="text-center text-muted-foreground flex flex-wrap justify-center items-center gap-x-4 gap-y-1 pt-2">
                            <span className="flex items-center text-xs"><Calendar className="mr-1.5 h-3 w-3" /> {story.createdAt}</span>
                            {story.genre && <span className="flex items-center text-xs"><Type className="mr-1.5 h-3 w-3" /> {story.genre}</span>}
                            {story.yearsTogether !== undefined && <span className="flex items-center text-xs"><Star className="mr-1.5 h-3 w-3 text-yellow-500" /> {story.yearsTogether} лет вместе</span>}
                        </CardDescription>
                         {/* Отображение ключевых слов */}
                        {(story.keywords?.keyword1 || story.keywords?.keyword2) && (
                            <div className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
                                <Tag className="h-3 w-3 inline-block"/> Ключевые слова:
                                {story.keywords.keyword1 && <span className="bg-secondary px-1.5 py-0.5 rounded">{story.keywords.keyword1}</span>}
                                {story.keywords.keyword2 && <span className="bg-secondary px-1.5 py-0.5 rounded">{story.keywords.keyword2}</span>}
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="px-6 md:px-8 py-6">
                        <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                            {story.storyText}
                        </p>
                         {/* Можно добавить отображение ответов */}
                    </CardContent>

                    <Separator />

                    {/* Футер с кнопками действий */}
                    <CardFooter className="p-4 bg-muted/30 flex flex-col sm:flex-row gap-2 justify-end">
                         <Button onClick={copyToClipboard} variant="outline" size="sm">
                             <Copy className="mr-2 h-4 w-4" />
                             Скопировать
                         </Button>
                         {typeof navigator.share !== 'undefined' && ( // Показываем только если поддерживается
                             <Button onClick={shareStory} variant="outline" size="sm">
                                 <Share2 className="mr-2 h-4 w-4" />
                                 Поделиться
                             </Button>
                         )}
                         {/* Кнопка удаления с подтверждением */}
                         <AlertDialog>
                             <AlertDialogTrigger asChild>
                                 <Button variant="destructive" size="sm">
                                     <Trash2 className="mr-2 h-4 w-4" />
                                     Удалить
                                 </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                                 <AlertDialogHeader>
                                     <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                     <AlertDialogDescription>
                                         Это действие необратимо. История будет удалена навсегда.
                                     </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                     <AlertDialogCancel>Отмена</AlertDialogCancel>
                                     <AlertDialogAction
                                         onClick={handleDelete}
                                         className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                         Удалить
                                     </AlertDialogAction>
                                 </AlertDialogFooter>
                             </AlertDialogContent>
                         </AlertDialog>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}