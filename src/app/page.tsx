
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { generateAlternativeStory } from '@/ai/flows/generate-alternative-story';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Copy, User, Star, Share2, Heart, LogIn, LogOut, UserPlus, History, Loader2, HelpCircle,
    BookOpen, Clapperboard, Dumbbell, Ghost, Microscope, Tent, Target, Combine, Moon, // Добавили иконки для новых жанров
    Briefcase, Coffee // Альтернативные иконки
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  // ... (остальные импорты DropdownMenu)
} from "@/components/ui/dropdown-menu";
import { auth, db } from "@/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  // === Новая категория ===
  futurePlans: [
      { id: 'question7', text: 'Какой суперспособностью вы точно НЕ будете обладать через 10 лет?' },
      { id: 'question8', text: 'На какой планете вы НЕ собираетесь провести медовый месяц?' },
  ]
};

const crazyAnswers = {
  question1: ['На вершине Эвереста во время чаепития', 'Внутри гигантского пончика', 'Во время телепортации в разные вселенные'],
  question2: ['Фиолетовый нарвал шепчет', 'Банановая сингулярность', 'Электромагнитный импульс любви'],
  question3: ['Костюм банана', 'Платье из воздушных шаров', 'Шлем из фольги'],
  question4: ['Прыгали с парашютом с дирижабля', 'Играли в шахматы под водой с акулами', 'Участвовали в гонках на тракторах по Луне'],
  question5: ['Ручной динозавр', 'Огненный феникс', 'Гигантский говорящий муравей'],
  question6: ['Зонтик во время солнечного затмения', 'Запасной скафандр на пляже', 'Инструкция по выживанию в зомби-апокалипсисе на свадьбе'],
  // === Ответы для новых вопросов ===
  question7: ['Умение печь идеальные блины силой мысли', 'Способность говорить с мебелью', 'Дышать под водой (но только в газировке)'],
  question8: ['Юпитер (слишком газообразно)', 'Планета Ка-Пэкс (нет отзывов на TripAdvisor)', 'Венера (жарковато для романтики)'],
};

// Обновляем жанры и добавляем CSS классы для стилизации
const genreDetails: { [key: string]: { icon: React.ElementType, className: string } } = {
    "Смешная": { icon: Dumbbell, className: 'story-genre-smeshnaya' },
    "Фантастическая": { icon: Tent, className: 'story-genre-fantasticheskaya' },
    "Романтическая (с иронией)": { icon: Heart, className: 'story-genre-romanticheskaya-\(s-ironiey\)' },
    "Как в кино": { icon: Clapperboard, className: 'story-genre-kak-v-kino' },
    "Научная фантастика": { icon: Microscope, className: 'story-genre-nauchnaya-fantastika' },
    "Сказка": { icon: BookOpen, className: 'story-genre-skazka' },
    "Детектив": { icon: User, className: 'story-genre-detektiv' },
    "Хоррор (юмористический)": { icon: Ghost, className: 'story-genre-horror-\(yumoristicheskiy\)' },
    // === Новые жанры ===
    "Шпионский боевик": { icon: Target, className: 'story-genre-spy' }, // Используем Target
    "Вестерн": { icon: Combine, className: 'story-genre-western' }, // Используем Combine
    "Нуар": { icon: Coffee, className: 'story-genre-noir' }, // Используем Coffee
};

// --- Массив сообщений для загрузки ---
const loadingMessages = [
    "Подбираем рифмы к слову 'вулкан'...",
    "Консультируемся с музами абсурда...",
    "Переписываем законы физики...",
    "Ищем НЕсуществующие совпадения...",
    "Генерируем альтернативную реальность...",
    "Добавляем щепотку безумия...",
    "Настраиваем потоки юмора...",
    "Заряжаем генератор нелепостей...",
    "Оживляем самые смелые НЕ-фантазии...",
    "Почти готово, осталось НЕ перепутать имена!",
];

// --- Конец констант ---

export default function Home() {
  // --- Состояния компонента ---
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [partner1PetName, setPartner1PetName] = useState('');
  const [partner2PetName, setPartner2PetName] = useState('');
  const [question1Answer, setQuestion1Answer] = useState('');
  const [question2Answer, setQuestion2Answer] = useState('');
  const [question3Answer, setQuestion3Answer] = useState('');
  const [question4Answer, setQuestion4Answer] = useState('');
  const [question5Answer, setQuestion5Answer] = useState('');
  const [question6Answer, setQuestion6Answer] = useState('');
  const [question7Answer, setQuestion7Answer] = useState('');
  const [question8Answer, setQuestion8Answer] = useState('');
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');
  const [keyword3, setKeyword3] = useState('');
  const [yearsTogether, setYearsTogether] = useState<number>(1);
  const [alternativeStory, setAlternativeStory] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [genre, setGenre] = useState('Смешная');
  // === Новое состояние для сообщения загрузки ===
  const [loadingMessage, setLoadingMessage] = useState('');
  // --- Конец состояний ---

  // --- Хуки ---
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const storyTextRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();
  // === Ref для интервала смены сообщений ===
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // --- Конец хуков ---

  // --- Эффекты ---
  useEffect(() => {
    // Скролл к результату (без изменений)
      if (alternativeStory && storyTextRef.current) {
        const timer = setTimeout(() => {
            if (storyTextRef.current) {
               storyTextRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
        return () => clearTimeout(timer);
      }
  }, [alternativeStory]);

  // Очистка интервала при размонтировании
  useEffect(() => {
      return () => {
          if (intervalRef.current) {
              clearInterval(intervalRef.current);
          }
      };
  }, []);
  // --- Конец эффектов ---

  // Определяем, какие вопросы показывать (теперь включает 8)
  const selectedQuestions = [
    ...questions.firstImpression,
    ...questions.awkwardMoments,
    ...questions.futurePlans, // Добавили новую категорию
  ];

  // --- Функции-обработчики ---
  const handleSubmit = async () => {
    setIsGenerating(true);
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]); // Установить первое случайное сообщение
    setAlternativeStory('');

    // Запускаем интервал смены сообщений
    intervalRef.current = setInterval(() => {
        setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 3000); // Меняем каждые 3 секунды

    try {
      const result = await generateAlternativeStory({
        partner1Name,
        partner2Name,
        partner1PetName,
        partner2PetName,
        question1Answer,
        question2Answer,
        question3Answer,
        question4Answer,
        question5Answer,
        question6Answer,
        question7Answer,
        question8Answer,
        keyword1,
        keyword2,
        keyword3,
        yearsTogether: Number(yearsTogether) || 1,
        genre,
      });
      setAlternativeStory(result.alternativeStory);
    } catch (error) {
      console.error('Failed to generate story:', error);
      toast({ title: "Ошибка генерации", description: "Не удалось создать историю. Попробуйте еще раз.", variant: "destructive" });
      setAlternativeStory('');
    } finally {
      setIsGenerating(false);
      // Очищаем интервал и сообщение после завершения
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setLoadingMessage('');
    }
  };

  const generateRandomAnswers = () => {
    const displayedQuestionIds = selectedQuestions.map(q => q.id);
    const setters: Record<string, React.Dispatch<React.SetStateAction<string>>> = {
        question1: setQuestion1Answer,
        question2: setQuestion2Answer,
        question3: setQuestion3Answer,
        question4: setQuestion4Answer,
        question5: setQuestion5Answer,
        question6: setQuestion6Answer,
        question7: setQuestion7Answer, // Добавили сеттер 7
        question8: setQuestion8Answer, // Добавили сеттер 8
        keyword1: setKeyword1, // Сеттеры для ключевых слов
        keyword2: setKeyword2,
        keyword3: setKeyword3,
    };

    displayedQuestionIds.forEach(qId => {
        if (crazyAnswers[qId as keyof typeof crazyAnswers] && setters[qId]) {
            const possibleAnswers = crazyAnswers[qId as keyof typeof crazyAnswers];
            setters[qId](possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)]);
        }
    });

    // Рандомизация ключевых слов
    const keywords = ["космос", "пицца", "пингвин", "шляпа", "кактус", "секрет", "река", "музыка", "дракон", "робот", "сыр", "путешествие"];
    setKeyword1(keywords[Math.floor(Math.random() * keywords.length)]);
    setKeyword2(keywords[Math.floor(Math.random() * keywords.length)]);
    setKeyword3(keywords[Math.floor(Math.random() * keywords.length)]); // Рандомизируем 3-е слово

    // Рандомизация обращений (опционально)
    const petNames = ["Котик", "Зайка", "Солнце", "Рыбка", "Птичка", "Малыш", "", ""]; // Добавим пустые строки для разнообразия
    setPartner1PetName(petNames[Math.floor(Math.random() * petNames.length)]);
    setPartner2PetName(petNames[Math.floor(Math.random() * petNames.length)]);


    setYearsTogether(Math.floor(Math.random() * 20) + 1);
    const genres = Object.keys(genreDetails);
    setGenre(genres[Math.floor(Math.random() * genres.length)]);

    toast({ title: "Случайные ответы!", description: "Все поля (кроме имен) заполнены случайными значениями." });
  };

  const copyToClipboard = () => {
     // ... (код без изменений) ...
      if (!alternativeStory) return;
      navigator.clipboard.writeText(alternativeStory).then(() => {
        toast({ title: "Текст истории скопирован!", description: "Теперь вы можете поделиться текстом где угодно." });
      }).catch(err => {
        toast({ title: "Ошибка копирования", description: "Не удалось скопировать текст истории.", variant: "destructive" });
        console.error("Failed to copy text: ", err);
      });
  };

  const shareStory = async () => {
    // ... (код без изменений, включая console.log для отладки) ...
      if (!alternativeStory) {
          toast({ title: "Нет истории", description: "Сначала сгенерируйте историю.", variant: "destructive" });
          return;
      }
      const shareData = {
        title: 'История Наоборот',
        text: `Посмотрите, какая альтернативная история знакомства у нас получилась с ${partner1Name || 'партнером 1'} и ${partner2Name || 'партнером 2'}! \n\n"${alternativeStory}"\n\nСоздайте свою смешную историю здесь: ${window.location.href}`,
        url: window.location.href,
      };
      console.log("Attempting to share:", shareData);
      console.log("Is HTTPS/localhost?", window.location.protocol === 'https:' || window.location.hostname === 'localhost');
      console.log("navigator.share supported?", typeof navigator.share);
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          console.log('Successfully shared');
        } catch (error) {
          console.error('Sharing failed:', error);
          if (error instanceof Error && error.name !== 'AbortError') {
               toast({ title: "Ошибка", description: "Не удалось поделиться. Попробуйте скопировать текст.", variant: "destructive" });
          } else {
              console.log("Sharing aborted by user.");
          }
        }
      } else {
        console.log("navigator.share not supported, falling back to copy.");
        copyToClipboard();
        toast({ title: "Копирование вместо 'Поделиться'", description: "Ваш браузер не поддерживает функцию 'Поделиться'. Текст истории скопирован в буфер обмена." });
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
      partner1PetName, // Сохраняем обращение 1
      partner2PetName, // Сохраняем обращение 2
      yearsTogether: Number(yearsTogether) || 1,
      genre,
      storyText: alternativeStory,
      answers: { // Сохраняем все ответы
          question1Answer, question2Answer, question3Answer,
          question4Answer, question5Answer, question6Answer,
          question7Answer, question8Answer
      },
      keywords: { keyword1, keyword2, keyword3 }, // Сохраняем все слова
      createdAt: serverTimestamp()
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
    // ... (код без изменений) ...
      try {
        await signOut(auth);
        toast({ title: "Вы вышли из системы." });
      } catch (error) {
        console.error("Ошибка выхода:", error);
        toast({ title: "Ошибка", description: "Не удалось выйти.", variant: "destructive" });
      }
  };
  // --- Конец функций ---

  // --- Отображение загрузки (без изменений) ---
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-f0f8ff">
        <Loader2 className="h-16 w-16 animate-spin text-a020f0" />
      </div>
    );
  }
  // --- Конец отображения загрузки ---

  const storyGenreClass = genreDetails[genre]?.className || 'story-genre-default';

  // --- Рендеринг компонента ---
  return (
    <TooltipProvider>
      {/* Убрали bg-f0f8ff отсюда, т.к. фон теперь на body */}
      <div className="flex flex-col items-center justify-center min-h-screen py-6 px-2 relative overflow-x-hidden">

        {/* --- Меню пользователя (добавим анимацию) --- */}
        <div className="fixed top-4 right-4 z-50">
             <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                     <Button variant="outline" size="icon" className="rounded-full bg-card/80 backdrop-blur-sm hover:bg-accent/90 border-border/50 shadow-md interactive-scale">
                         <span className="flex items-center justify-center">
                            <User className="h-5 w-5" />
                         </span>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl"
        >
          {/* Добавляем анимацию тени */}
          <Card className="space-y-4 p-6 md:p-8 rounded-xl shadow-lg bg-card/90 backdrop-blur-sm border border-border/30 interactive-shadow">
            <CardHeader className="p-0 mb-4">
                {/* Применяем класс title */}
                <CardTitle className="title text-3xl md:text-4xl font-bold text-center text-a020f0">
                  История Наоборот
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground text-center">
                  Ответьте на НЕ-вопросы и получите забавную альтернативную историю вашей встречи!
                </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-6">
              {/* === Имена и Обращения === */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Имя 1 */}
                <div className="space-y-2">
                  <Label htmlFor="partner1Name" className="text-sm font-medium flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" /> Имя первого партнера
                    <Tooltip><TooltipTrigger asChild><HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Как вас зовут?</p></TooltipContent></Tooltip>
                  </Label>
                  <Input id="partner1Name" type="text" placeholder="Например, Бэлла" value={partner1Name} onChange={(e) => setPartner1Name(e.target.value)} className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"/>
                </div>
                 {/* Обращение 1 */}
                <div className="space-y-2">
                  <Label htmlFor="partner1PetName" className="text-sm font-medium flex items-center">
                    <Heart className="mr-2 h-4 w-4 text-muted-foreground" /> Обращение к 1-му (необяз.)
                    <Tooltip><TooltipTrigger asChild><HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Ласковое прозвище для первого партнера (Котик, Зайка...). ИИ попробует его использовать.</p></TooltipContent></Tooltip>
                  </Label>
                  <Input id="partner1PetName" type="text" placeholder="Например, Котик" value={partner1PetName} onChange={(e) => setPartner1PetName(e.target.value)} className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"/>
                </div>
                {/* Имя 2 */}
                <div className="space-y-2">
                  <Label htmlFor="partner2Name" className="text-sm font-medium flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" /> Имя второго партнера
                     <Tooltip><TooltipTrigger asChild><HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Имя вашего партнера.</p></TooltipContent></Tooltip>
                  </Label>
                  <Input id="partner2Name" type="text" placeholder="Например, Эдвард" value={partner2Name} onChange={(e) => setPartner2Name(e.target.value)} className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"/>
                </div>
                 {/* Обращение 2 */}
                <div className="space-y-2">
                  <Label htmlFor="partner2PetName" className="text-sm font-medium flex items-center">
                    <Heart className="mr-2 h-4 w-4 text-muted-foreground" /> Обращение ко 2-му (необяз.)
                    <Tooltip><TooltipTrigger asChild><HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Ласковое прозвище для второго партнера.</p></TooltipContent></Tooltip>
                  </Label>
                  <Input id="partner2PetName" type="text" placeholder="Например, Солнце" value={partner2PetName} onChange={(e) => setPartner2PetName(e.target.value)} className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"/>
                </div>
              </div>
              {/* --- Конец имен и обращений --- */}

              <Separator />

              {/* --- Блок вопросов (теперь 8 вопросов) --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-4 gap-y-5 md:items-start">
                  {selectedQuestions.map((question, index) => ( // Добавили index для задержки анимации
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }} // Задержка по индексу
                      className="space-y-2"
                    >
                      <Label htmlFor={question.id} className="text-sm font-medium min-h-[2.5rem] flex items-center">
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
                          question.id === 'question6' ? question6Answer :
                          question.id === 'question7' ? question7Answer : // Добавили 7
                          question.id === 'question8' ? question8Answer : '' // Добавили 8
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (question.id === 'question1') setQuestion1Answer(value);
                          else if (question.id === 'question2') setQuestion2Answer(value);
                          else if (question.id === 'question3') setQuestion3Answer(value);
                          else if (question.id === 'question4') setQuestion4Answer(value);
                          else if (question.id === 'question5') setQuestion5Answer(value);
                          else if (question.id === 'question6') setQuestion6Answer(value);
                          else if (question.id === 'question7') setQuestion7Answer(value); // Добавили 7
                          else if (question.id === 'question8') setQuestion8Answer(value); // Добавили 8
                        }}
                        className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0 interactive-scale" /* Добавили анимацию */
                      />
                    </motion.div>
                  ))}
              </div>
              {/* --- Конец блока вопросов --- */}

              <Separator />

              {/* --- Ключевые слова (теперь 3) --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-start">
                  <div className="space-y-2">
                    <Label htmlFor="keyword1" className="text-sm font-medium flex items-center">
                      Ключевое слово 1 (необяз.)
                      <Tooltip><TooltipTrigger asChild><HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Слово/фраза для уникальности.</p></TooltipContent></Tooltip>
                    </Label>
                    <Input id="keyword1" type="text" placeholder="Любимая еда..." value={keyword1} onChange={(e) => setKeyword1(e.target.value)} className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0 interactive-scale"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keyword2" className="text-sm font-medium flex items-center">
                      Ключевое слово 2 (необяз.)
                       <Tooltip><TooltipTrigger asChild><HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Еще одно слово/фраза.</p></TooltipContent></Tooltip>
                    </Label>
                    <Input id="keyword2" type="text" placeholder="Общий мем..." value={keyword2} onChange={(e) => setKeyword2(e.target.value)} className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0 interactive-scale"/>
                  </div>
                  {/* === Новое поле для 3-го слова === */}
                  <div className="space-y-2">
                    <Label htmlFor="keyword3" className="text-sm font-medium flex items-center">
                      Ключевое слово 3 (необяз.)
                       <Tooltip><TooltipTrigger asChild><HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>И еще одно для вдохновения ИИ!</p></TooltipContent></Tooltip>
                    </Label>
                    <Input id="keyword3" type="text" placeholder="Тайное желание..." value={keyword3} onChange={(e) => setKeyword3(e.target.value)} className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0 interactive-scale"/>
                  </div>
              </div>
              {/* --- Конец Ключевых слов --- */}

              <Separator />

              {/* --- Годы и Жанр (выпадающий список обновлен) --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-start">
                  <div className="space-y-2">
                       <Label htmlFor="yearsTogether" className="text-sm font-medium flex items-center">
                           <Star className="mr-2 inline-block h-4 w-4 text-yellow-500" /> Сколько лет вы вместе?
                           <Tooltip><TooltipTrigger asChild><HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Число лет будет забавно вплетено в историю.</p></TooltipContent></Tooltip>
                       </Label>
                       <Input id="yearsTogether" type="number" min="0" placeholder="Например, 5" value={yearsTogether.toString()} onChange={(e) => setYearsTogether(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)} className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0 interactive-scale"/>
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="genre" className="text-sm font-medium flex items-center">
                         Выберите тон / жанр истории
                         <Tooltip><TooltipTrigger asChild><HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Задайте настроение вашей вымышленной истории.</p></TooltipContent></Tooltip>
                     </Label>
                     <Select value={genre} onValueChange={setGenre}>
                        {/* Добавляем анимацию к триггеру Select */}
                        <SelectTrigger className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0 interactive-scale">
                           <SelectValue placeholder="Выберите тон истории" />
                        </SelectTrigger>
                        <SelectContent>
                           {Object.entries(genreDetails).map(([genreName, details]) => (
                           <SelectItem key={genreName} value={genreName}>
                              <div className="flex items-center">
                                 <details.icon className="mr-2 h-4 w-4" />
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
                 {/* Кнопка Создать - добавляем анимацию и отображение loadingMessage */}
                 <Button
                   onClick={handleSubmit}
                   disabled={isGenerating || !partner1Name || !partner2Name}
                   className="flex-1 bg-a020f0 text-white rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 py-3 text-base interactive-scale" /* Добавили анимацию */
                 >
                   {isGenerating ? (
                     <span className="inline-flex items-center justify-center px-2"> {/* Добавили padding для читаемости */}
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       {/* Отображаем меняющееся сообщение или дефолтное */}
                       {loadingMessage || 'Генерация...'}
                     </span>
                   ) : (
                     'Создать историю!'
                   )}
                 </Button>
                 {/* Кнопка Удиви меня - добавляем анимацию */}
                 <Tooltip>
                   <TooltipTrigger asChild>
                       <Button type="button" onClick={generateRandomAnswers} variant="outline" className="flex-1 rounded-md shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary-500 py-3 text-base interactive-scale">
                           Удиви меня! (Случайные ответы)
                       </Button>
                   </TooltipTrigger>
                   <TooltipContent><p>Заполнить все поля (кроме имен) случайными смешными вариантами.</p></TooltipContent>
                 </Tooltip>
               </div>

               {/* --- Блок с результатом --- */}
               <AnimatePresence>
                  {alternativeStory && (
                    <motion.div
                      key="story-result"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4 mt-6 p-4 border rounded-lg bg-background/80 backdrop-blur-sm overflow-hidden"
                    >
                      <Label htmlFor="alternativeStoryOutput" className="text-base font-semibold text-a020f0">
                        Ваша альтернативная история:
                      </Label>
                      <p id="alternativeStoryOutput" ref={storyTextRef} className={cn("story-text whitespace-pre-wrap", storyGenreClass)}>
                        {alternativeStory}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-center pt-2">
                        {/* Кнопка Сохранить - добавляем анимацию */}
                        {currentUser && (
                          <Button onClick={handleSaveStory} disabled={isSaving} className="min-w-[160px] bg-green-600 hover:bg-green-700 text-white interactive-scale">
                            {isSaving ? (
                               <span className="inline-flex items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                               </span>
                            ) : (
                                <span className="inline-flex items-center justify-center">
                                   <Heart className="mr-2 h-4 w-4" /> Сохранить
                                </span>
                            )}
                             {!isSaving && <span className="sr-only"> Сохранить</span>}
                             {isSaving && <span className="ml-2">Сохранение...</span>}
                          </Button>
                         )}
                         {/* Кнопка Копировать - добавляем анимацию */}
                        <Button onClick={copyToClipboard} className="min-w-[160px] interactive-scale" variant="outline">
                           <span className="inline-flex items-center justify-center">
                             <Copy className="mr-2 h-4 w-4" /> Скопировать текст
                           </span>
                        </Button>
                        {/* Кнопка Поделиться - добавляем анимацию */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={shareStory} className="min-w-[160px] interactive-scale" variant="outline" disabled={!alternativeStory}>
                                    <span className="inline-flex items-center justify-center">
                                        <Share2 className="mr-2 h-4 w-4" /> Поделиться
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom"> <p>{typeof navigator.share !== 'undefined' ? 'Поделиться через стандартное меню ОС' : 'Скопировать текст (функция "Поделиться" недоступна)'}</p> </TooltipContent>
                        </Tooltip>
                        {/* Кнопка Поддержать - добавляем анимацию */}
                         <Button asChild variant="outline" className="min-w-[160px] interactive-scale">
                            <a href="https://boosty.to/altigerg" target="_blank" rel="noopener noreferrer">
                                <span className="inline-flex items-center justify-center">
                                    <Heart className="mr-2 h-4 w-4 text-red-500"/> Поддержать автора
                                </span>
                            </a>
                         </Button>
                      </div>
                      {!currentUser && ( <p className="text-xs text-center text-muted-foreground mt-3"> <Link href="/signin" className="underline hover:text-a020f0">Войдите</Link> или <Link href="/signup" className="underline hover:text-a020f0">зарегистрируйтесь</Link>, чтобы сохранять свои истории. </p> )}
                    </motion.div>
                  )}
                </AnimatePresence>
               {/* --- Конец Блока с результатом --- */}

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
  // --- Конец Рендеринга ---
}
