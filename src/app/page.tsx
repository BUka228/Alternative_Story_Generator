
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { generateAlternativeStory } from '@/ai/flows/generate-alternative-story';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Copy, User, Star, Share2, Heart, LogIn, LogOut, UserPlus, History, Settings, Loader2,
    BookOpen, Clapperboard, Dumbbell, Gem, Ghost, Microscope, Tent, Tv // Gem, Tv - не использовались, но оставим
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth, db } from "@/firebase/firebaseConfig"; // Импортируем auth и db
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Для сохранения
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // <-- Импортируем хук useAuth
import Link from 'next/link'; // Для ссылок на страницы входа/регистрации

// --- Константы вопросов и ответов ---
const questions = {
  firstImpression: [
    { id: 'question1', text: 'Где вы впервые НЕ встретились?' },
    { id: 'question2', text: 'Какое кодовое слово чуть НЕ стало началом вашей дружбы?' },
    { id: 'question3', text: 'Что вы точно НЕ надели бы на первое свидание?' },
  ],
  awkwardMoments: [
    { id: 'question4', text: 'Что самое абсурдное вы точно НЕ делали вместе?' },
    { id: 'question5', text: 'Какое животное ни в коем случае НЕ стало вашим питомцем?' },
    { id: 'question6', text: 'Что ни в коем случае НЕ было забыто в важный момент?' },
  ],
  // Убрал неиспользуемые категории для краткости, можно вернуть при необходимости
};

const crazyAnswers = {
  question1: ['На вершине Эвереста во время чаепития', 'Внутри гигантского пончика', 'Во время телепортации в разные вселенные'],
  question2: ['Фиолетовый нарвал шепчет', 'Банановая сингулярность', 'Электромагнитный импульс любви'],
  question3: ['Костюм банана', 'Платье из воздушных шаров', 'Шлем из фольги'],
  question4: ['Прыгали с парашютом с дирижабля', 'Играли в шахматы под водой с акулами', 'Участвовали в гонках на тракторах по Луне'],
  question5: ['Ручной динозавр', 'Огненный феникс', 'Гигантский говорящий муравей'],
  question6: ['Зонтик во время солнечного затмения', 'Запасной скафандр на пляже', 'Инструкция по выживанию в зомби-апокалипсисе на свадьбе'],
  // ... (можно добавить ответы для questions 7-11, если вернуть эти вопросы)
};

const genreIcons = {
    "Смешная": Dumbbell,
    "Фантастическая": Tent,
    "Романтическая (с иронией)": Heart,
    "Как в кино": Clapperboard,
    "Научная фантастика": Microscope,
    "Сказка": BookOpen,
    "Детектив": User, // Можно заменить на Search или другую иконку
    "Хоррор (юмористический)": Ghost,
};
// --- Конец констант ---

export default function Home() {
  // --- Состояния компонента ---
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [question1Answer, setQuestion1Answer] = useState('');
  const [question2Answer, setQuestion2Answer] = useState('');
  const [question3Answer, setQuestion3Answer] = useState('');
  const [question4Answer, setQuestion4Answer] = useState('');
  const [question5Answer, setQuestion5Answer] = useState('');
  const [question6Answer, setQuestion6Answer] = useState('');
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');
  const [yearsTogether, setYearsTogether] = useState<number>(1);
  const [alternativeStory, setAlternativeStory] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false); // Переименовал isLoading для ясности
  const [isSaving, setIsSaving] = useState(false); // Состояние для сохранения
  const [genre, setGenre] = useState('Смешная');
  // --- Конец состояний ---

  // --- Хуки ---
  const { currentUser, loading: authLoading } = useAuth(); // Получаем пользователя и статус загрузки Auth
  const { toast } = useToast();
  const storyRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();
  // --- Конец хуков ---

  // --- Эффекты ---
  useEffect(() => {
    // Плавный скролл к сгенерированной истории
    if (alternativeStory && storyRef.current) {
      storyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [alternativeStory]);
  // --- Конец эффектов ---

  // --- Функции-обработчики ---
  const handleSubmit = async () => {
    setIsGenerating(true);
    setAlternativeStory(''); // Сбрасываем предыдущую историю
    try {
      const result = await generateAlternativeStory({
        partner1Name,
        partner2Name,
        question1Answer,
        question2Answer,
        question3Answer,
        question4Answer,
        question5Answer,
     
        keyword1,
        keyword2,
        yearsTogether: Number(yearsTogether) || 1, // Убедимся, что это число
        genre,
      });
      setAlternativeStory(result.alternativeStory);
    } catch (error) {
      console.error('Failed to generate story:', error);
      toast({ title: "Ошибка генерации", description: "Не удалось создать историю. Попробуйте еще раз.", variant: "destructive" });
      setAlternativeStory(''); // Очищаем в случае ошибки
    } finally {
      setIsGenerating(false);
    }
  };

  // Определяем, какие вопросы показывать (теперь включает 6)
  const selectedQuestions = [
    ...questions.firstImpression,
    ...questions.awkwardMoments,
  ];

  const generateRandomAnswers = () => {
    // Используем только ключи вопросов, которые реально отображаются
    const displayedQuestionIds = selectedQuestions.map(q => q.id);
    const setters: Record<string, React.Dispatch<React.SetStateAction<string>>> = {
        question1: setQuestion1Answer,
        question2: setQuestion2Answer,
        question3: setQuestion3Answer,
        question4: setQuestion4Answer,
        question5: setQuestion5Answer,
        question6: setQuestion6Answer, // Добавили сеттер для 6 вопроса
    };

    displayedQuestionIds.forEach(qId => {
        if (crazyAnswers[qId as keyof typeof crazyAnswers] && setters[qId]) {
            const possibleAnswers = crazyAnswers[qId as keyof typeof crazyAnswers];
            setters[qId](possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)]);
        }
    });

    // Можно также рандомизировать имена, годы, жанр и ключевые слова для полного веселья
    // setPartner1Name(...)
    // setYearsTogether(...)
    // setGenre(...)
  };

  const copyToClipboard = () => {
    if (!alternativeStory) return;
    navigator.clipboard.writeText(alternativeStory).then(() => {
      toast({ title: "История скопирована!", description: "Теперь вы можете поделиться ею где угодно." });
    }).catch(err => {
      toast({ title: "Ошибка копирования", description: "Не удалось скопировать историю.", variant: "destructive" });
      console.error("Failed to copy text: ", err);
    });
  };

  const shareStory = async () => {
    if (!alternativeStory) return;
    const shareData = {
      title: 'История Наоборот',
      text: `Посмотрите, какая альтернативная история знакомства у нас получилась с ${partner1Name || 'партнером 1'} и ${partner2Name || 'партнером 2'}! \n\n"${alternativeStory}"\n\nСоздайте свою смешную историю здесь: ${window.location.href}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Уведомление не нужно, т.к. ОС покажет свое
      } catch (error) {
         // Ошибку 'AbortError' можно игнорировать (пользователь закрыл окно)
        if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Sharing failed:', error);
             toast({ title: "Ошибка", description: "Не удалось поделиться.", variant: "destructive" });
        }
      }
    } else {
      copyToClipboard(); // Фоллбэк для браузеров без navigator.share
      toast({ title: "Скопировано!", description: "Ссылка и история скопированы. Поделитесь ими вручную!" });
    }
  };

  const handleSaveStory = async () => {
    if (!currentUser) {
      toast({ title: "Требуется вход", description: "Пожалуйста, войдите или зарегистрируйтесь, чтобы сохранить историю.", variant: "destructive" });
      return;
    }
    if (!alternativeStory) {
      toast({ title: "Нет истории", description: "Сначала сгенерируйте историю.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const storyData = {
      userId: currentUser.uid,
      partner1Name,
      partner2Name,
      yearsTogether: Number(yearsTogether) || 1,
      genre,
      storyText: alternativeStory,
      // Сохраняем ответы и ключевые слова, если нужно
      answers: { question1Answer, question2Answer, question3Answer, question4Answer, question5Answer, question6Answer }, // Добавили q6
      keywords: { keyword1, keyword2 },
      createdAt: serverTimestamp() // Используем серверное время
    };

    try {
      await addDoc(collection(db, 'stories'), storyData);
      toast({ title: "Успех!", description: "История сохранена в вашем профиле.", duration: 3000 });
    } catch (error) {
      console.error("Ошибка при сохранении истории: ", error);
      toast({ title: "Ошибка", description: "Не удалось сохранить историю.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Вы вышли из системы." });
      // Можно добавить router.push('/') если нужно перенаправление
    } catch (error) {
      console.error("Ошибка выхода:", error);
      toast({ title: "Ошибка", description: "Не удалось выйти.", variant: "destructive" });
    }
  };
  // --- Конец функций ---

  // --- Отображение загрузки ---
  if (authLoading) {
    return (
      // Убран стиль с фоновым изображением
      <div className="flex justify-center items-center min-h-screen bg-f0f8ff">
        <Loader2 className="h-16 w-16 animate-spin text-a020f0" />
      </div>
    );
  }
  // --- Конец отображения загрузки ---

  // --- Рендеринг компонента ---
  return (
    // Убран стиль с фоновым изображением
    <div className="flex flex-col items-center justify-center min-h-screen py-6 px-2 bg-f0f8ff relative">

      {/* --- Меню пользователя (позиционировано абсолютно) --- */}
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full bg-card/80 backdrop-blur-sm hover:bg-accent/90 border-border/50 shadow-md">
              <User className="h-5 w-5" />
              <span className="sr-only">Открыть меню пользователя</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {currentUser ? (
              <>
                <DropdownMenuLabel className='truncate px-2 py-1.5 text-sm font-semibold'>
                  {currentUser.email || 'Мой аккаунт'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/my-stories')}>
                  <History className="mr-2 h-4 w-4" />
                  <span>Мои истории</span>
                </DropdownMenuItem>
                {/* <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                 <DropdownMenuItem onClick={() => router.push('/signin')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Войти</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/signup')}>
                   <UserPlus className="mr-2 h-4 w-4" />
                  <span>Регистрация</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* --- Конец меню пользователя --- */}

      {/* Основная карточка */}
      <Card className="w-full max-w-5xl space-y-4 p-6 md:p-8 rounded-xl shadow-lg bg-card/90 backdrop-blur-sm border border-border/30">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="title text-2xl md:text-3xl font-semibold text-center text-a020f0">
            История Наоборот
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-center">
            Ответьте на НЕ-вопросы и получите забавную альтернативную историю вашей встречи!
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 space-y-6">
          {/* --- Имена партнеров --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partner1Name" className="text-sm font-medium flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                Имя первого партнера
              </Label>
              <Input
                id="partner1Name" type="text" placeholder="Например, Бэлла"
                value={partner1Name} onChange={(e) => setPartner1Name(e.target.value)}
                className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner2Name" className="text-sm font-medium flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                Имя второго партнера
              </Label>
              <Input
                id="partner2Name" type="text" placeholder="Например, Эдвард"
                value={partner2Name} onChange={(e) => setPartner2Name(e.target.value)}
                className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
              />
            </div>
          </div>
          {/* --- Конец имен партнеров --- */}

          <Separator />

          {/* --- Блок вопросов --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              {selectedQuestions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label htmlFor={question.id} className="text-sm font-medium">
                    {question.text}
                  </Label>
                  <Input
                    id={question.id} type="text"
                    placeholder={crazyAnswers[question.id as keyof typeof crazyAnswers] ? crazyAnswers[question.id as keyof typeof crazyAnswers][0] : 'Ваш абсурдный ответ'}
                    value={
                      question.id === 'question1' ? question1Answer :
                      question.id === 'question2' ? question2Answer :
                      question.id === 'question3' ? question3Answer :
                      question.id === 'question4' ? question4Answer :
                      question.id === 'question5' ? question5Answer :
                      question.id === 'question6' ? question6Answer : '' // Привязываем состояние
                    }
                    onChange={(e) => { // Обновляем соответствующее состояние
                      const value = e.target.value;
                      if (question.id === 'question1') setQuestion1Answer(value);
                      else if (question.id === 'question2') setQuestion2Answer(value);
                      else if (question.id === 'question3') setQuestion3Answer(value);
                      else if (question.id === 'question4') setQuestion4Answer(value);
                      else if (question.id === 'question5') setQuestion5Answer(value);
                      else if (question.id === 'question6') setQuestion6Answer(value);
                    }}
                    className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
                  />
                </div>
              ))}
          </div>
          {/* --- Конец блока вопросов --- */}

          <Separator />

           {/* --- Ключевые слова --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keyword1" className="text-sm font-medium">
                  Ключевое слово 1 (необязательно)
                </Label>
                <Input
                  id="keyword1" type="text" placeholder="Секретное прозвище, любимая еда..."
                  value={keyword1} onChange={(e) => setKeyword1(e.target.value)}
                  className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyword2" className="text-sm font-medium">
                   Ключевое слово 2 (необязательно)
                </Label>
                <Input
                  id="keyword2" type="text" placeholder="Памятное место, общий мем..."
                  value={keyword2} onChange={(e) => setKeyword2(e.target.value)}
                  className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>
          </div>
          {/* --- Конец Ключевых слов --- */}

          <Separator />

          {/* --- Годы и Жанр --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-end">
              <div className="space-y-2">
                <Label htmlFor="yearsTogether" className="text-sm font-medium flex items-center">
                   <Star className="mr-2 inline-block h-4 w-4 text-yellow-500" />
                  Сколько лет вы вместе?
                </Label>
                <Input
                  id="yearsTogether" type="number" min="0" placeholder="Например, 5"
                  value={yearsTogether.toString()} onChange={(e) => setYearsTogether(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
                  className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre" className="text-sm font-medium">
                  Выберите тон / жанр истории
                </Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0">
                    <SelectValue placeholder="Выберите тон истории" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(genreIcons).map(([genreName, Icon]) => (
                      <SelectItem key={genreName} value={genreName}>
                        <div className="flex items-center">
                           <Icon className="mr-2 h-4 w-4" />
                           {genreName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </div>
          {/* --- Конец Годы и Жанр --- */}

          <Separator />

          {/* --- Кнопки действий --- */}
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isGenerating || !partner1Name || !partner2Name} // Блокируем, если нет имен
              className="flex-1 bg-a020f0 text-white rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 py-3 text-base"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Генерация...
                </>
              ) : (
                'Создать историю!'
              )}
            </Button>
            <Button
              type="button"
              onClick={generateRandomAnswers}
              variant="outline"
              className="flex-1 rounded-md shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary-500 py-3 text-base"
            >
              Удиви меня! (Случайные ответы)
            </Button>
          </div>
          {/* --- Конец Кнопок действий --- */}

          {/* --- Блок с результатом --- */}
          {alternativeStory && (
            <div className="space-y-4 mt-6 p-4 border rounded-lg bg-background/80 backdrop-blur-sm">
              <Label htmlFor="alternativeStory" className="text-base font-semibold text-a020f0">
                Ваша альтернативная история:
              </Label>
              <p className="story-text whitespace-pre-wrap" ref={storyRef}>{alternativeStory}</p> {/* Добавил whitespace-pre-wrap для сохранения переносов строки */}
              <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-center">
                {currentUser && (
                   <Button onClick={handleSaveStory} disabled={isSaving} className="min-w-[160px] bg-green-600 hover:bg-green-700 text-white">
                     {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
                     Сохранить
                   </Button>
                )}
                {typeof navigator.share !== 'undefined' ? (
                  // Показываем кнопку нативного шеринга, если браузер поддерживает
                  <Button onClick={shareStory} className="min-w-[160px]" variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Поделиться
                  </Button>
                ) : ( /* Фоллбэк для браузеров без navigator.share */
                    <Button onClick={copyToClipboard} className="min-w-[160px]" variant="outline">
                      <Copy className="mr-2 h-4 w-4" />
                      Скопировать
                    </Button>
                )}
                {!navigator.share && ( /* Показываем кнопку копирования отдельно, если нет share */
                     <Button onClick={copyToClipboard} className="min-w-[160px]" variant="outline">
                       <Copy className="mr-2 h-4 w-4" />
                       Скопировать текст
                     </Button>
                )}
                 <Button asChild variant="outline" className="min-w-[160px]">
                   <a href="https://boosty.to/altigerg" target="_blank" rel="noopener noreferrer">
                     <Heart className="mr-2 h-4 w-4 text-red-500"/>
                     Поддержать автора
                   </a>
                 </Button>
              </div>
               {!currentUser && (
                   <p className="text-xs text-center text-muted-foreground mt-3">
                       <Link href="/signin" className="underline hover:text-a020f0">Войдите</Link> или <Link href="/signup" className="underline hover:text-a020f0">зарегистрируйтесь</Link>, чтобы сохранять свои истории.
                   </p>
               )}
            </div>
          )}
          {/* --- Конец Блока с результатом --- */}

        </CardContent>
      </Card>
    </div>
  );
  // --- Конец Рендеринга ---
}
