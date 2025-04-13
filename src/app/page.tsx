
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
    Copy, User, Star, Share2, Heart, LogIn, LogOut, UserPlus, History, Settings, Loader2, HelpCircle, // Добавили HelpCircle
    BookOpen, Clapperboard, Dumbbell, Gem, Ghost, Microscope, Tent, Tv // Убрали FileText
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
};

const crazyAnswers = {
  question1: ['На вершине Эвереста во время чаепития', 'Внутри гигантского пончика', 'Во время телепортации в разные вселенные'],
  question2: ['Фиолетовый нарвал шепчет', 'Банановая сингулярность', 'Электромагнитный импульс любви'],
  question3: ['Костюм банана', 'Платье из воздушных шаров', 'Шлем из фольги'],
  question4: ['Прыгали с парашютом с дирижабля', 'Играли в шахматы под водой с акулами', 'Участвовали в гонках на тракторах по Луне'],
  question5: ['Ручной динозавр', 'Огненный феникс', 'Гигантский говорящий муравей'],
  question6: ['Зонтик во время солнечного затмения', 'Запасной скафандр на пляже', 'Инструкция по выживанию в зомби-апокалипсисе на свадьбе'],
};

const genreDetails: { [key: string]: { icon: React.ElementType, className: string } } = {
    "Смешная": { icon: Dumbbell, className: 'story-genre-smeshnaya' },
    "Фантастическая": { icon: Tent, className: 'story-genre-fantasticheskaya' },
    "Романтическая (с иронией)": { icon: Heart, className: 'story-genre-romanticheskaya-\(s-ironiey\)' },
    "Как в кино": { icon: Clapperboard, className: 'story-genre-kak-v-kino' },
    "Научная фантастика": { icon: Microscope, className: 'story-genre-nauchnaya-fantastika' },
    "Сказка": { icon: BookOpen, className: 'story-genre-skazka' },
    "Детектив": { icon: User, className: 'story-genre-detektiv' },
    "Хоррор (юмористический)": { icon: Ghost, className: 'story-genre-horror-\(yumoristicheskiy\)' },
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [genre, setGenre] = useState('Смешная');
  // --- Конец состояний ---

  // --- Хуки ---
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const storyTextRef = useRef<HTMLParagraphElement>(null); // Вернули ref на параграф <p>
  const router = useRouter();
  // --- Конец хуков ---

  // --- Эффекты ---
  useEffect(() => {
    // Плавный скролл к тексту истории после генерации
    if (alternativeStory && storyTextRef.current) {
       // Небольшая задержка перед скроллом, чтобы анимация успела отработать
      const timer = setTimeout(() => {
          if (storyTextRef.current) { // Доп. проверка на случай размонтирования
             storyTextRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Используем 'nearest'
          }
      }, 100); // Задержка 100 мс

      return () => clearTimeout(timer); // Очистка таймера при размонтировании или изменении alternativeStory
    }
  }, [alternativeStory]);
  // --- Конец эффектов ---

  // --- Функции-обработчики ---
  const handleSubmit = async () => {
    setIsGenerating(true);
    setAlternativeStory('');
    try {
      const result = await generateAlternativeStory({
        partner1Name,
        partner2Name,
        question1Answer,
        question2Answer,
        question3Answer,
        question4Answer,
        question5Answer,
        question6Answer,
        keyword1,
        keyword2,
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
    }
  };

  const selectedQuestions = [
    ...questions.firstImpression,
    ...questions.awkwardMoments,
  ];

  const generateRandomAnswers = () => {
    // ... (код без изменений) ...
     const displayedQuestionIds = selectedQuestions.map(q => q.id);
     const setters: Record<string, React.Dispatch<React.SetStateAction<string>>> = {
         question1: setQuestion1Answer,
         question2: setQuestion2Answer,
         question3: setQuestion3Answer,
         question4: setQuestion4Answer,
         question5: setQuestion5Answer,
         question6: setQuestion6Answer,
     };

     displayedQuestionIds.forEach(qId => {
         if (crazyAnswers[qId as keyof typeof crazyAnswers] && setters[qId]) {
             const possibleAnswers = crazyAnswers[qId as keyof typeof crazyAnswers];
             setters[qId](possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)]);
         }
     });
     const keywords = ["космос", "пицца", "пингвин", "шляпа", "кактус", "секрет", "река", "музыка"];
     setKeyword1(keywords[Math.floor(Math.random() * keywords.length)]);
     setKeyword2(keywords[Math.floor(Math.random() * keywords.length)]);
     setYearsTogether(Math.floor(Math.random() * 20) + 1);
     const genres = Object.keys(genreDetails);
     setGenre(genres[Math.floor(Math.random() * genres.length)]);

     toast({ title: "Случайные ответы!", description: "Все поля (кроме имен) заполнены случайными значениями." });
  };

  const copyToClipboard = () => {
    if (!alternativeStory) return;
    navigator.clipboard.writeText(alternativeStory).then(() => {
      toast({ title: "Текст истории скопирован!", description: "Теперь вы можете поделиться текстом где угодно." });
    }).catch(err => {
      toast({ title: "Ошибка копирования", description: "Не удалось скопировать текст истории.", variant: "destructive" });
      console.error("Failed to copy text: ", err);
    });
  };

  // Функция Копировать HTML удалена
  // const copyStoryAsHtml = () => { ... };

  const shareStory = async () => {
    if (!alternativeStory) {
        toast({ title: "Нет истории", description: "Сначала сгенерируйте историю.", variant: "destructive" });
        return;
    }

    const shareData = {
      title: 'История Наоборот',
      text: `Посмотрите, какая альтернативная история знакомства у нас получилась с ${partner1Name || 'партнером 1'} и ${partner2Name || 'партнером 2'}! \n\n"${alternativeStory}"\n\nСоздайте свою смешную историю здесь: ${window.location.href}`,
      url: window.location.href,
    };

    console.log("Attempting to share:", shareData); // Лог для отладки
    console.log("Is HTTPS/localhost?", window.location.protocol === 'https:' || window.location.hostname === 'localhost'); // Проверка контекста
    console.log("navigator.share supported?", typeof navigator.share); // Проверка поддержки

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Successfully shared');
        // Уведомление не нужно, ОС сама покажет
      } catch (error) {
        console.error('Sharing failed:', error);
        // Игнорируем ошибку отмены пользователем
        if (error instanceof Error && error.name !== 'AbortError') {
             toast({ title: "Ошибка", description: "Не удалось поделиться. Попробуйте скопировать текст.", variant: "destructive" });
        } else {
            console.log("Sharing aborted by user.");
        }
      }
    } else {
      console.log("navigator.share not supported, falling back to copy.");
      copyToClipboard(); // Фоллбэк для браузеров без navigator.share
      // Более явное сообщение для фоллбэка
      toast({ title: "Копирование вместо 'Поделиться'", description: "Ваш браузер не поддерживает функцию 'Поделиться'. Текст истории скопирован в буфер обмена." });
    }
  };


  const handleSaveStory = async () => {
    // ... (код без изменений) ...
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
       answers: { question1Answer, question2Answer, question3Answer, question4Answer, question5Answer, question6Answer },
       keywords: { keyword1, keyword2 },
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

  // --- Отображение загрузки ---
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
      <div className="flex flex-col items-center justify-center min-h-screen py-6 px-2 bg-f0f8ff relative overflow-x-hidden">

        {/* --- Меню пользователя (без изменений) --- */}
         <div className="absolute top-4 right-4 z-50">
           {/* ... (код меню без изменений) ... */}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl"
        >
          <Card className="space-y-4 p-6 md:p-8 rounded-xl shadow-lg bg-card/90 backdrop-blur-sm border border-border/30">
            <CardHeader className="p-0 mb-4">
              {/* ... (заголовок без изменений) ... */}
                <CardTitle className="title text-2xl md:text-3xl font-semibold text-center text-a020f0">
                  История Наоборот
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground text-center">
                  Ответьте на НЕ-вопросы и получите забавную альтернативную историю вашей встречи!
                </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-6">
              {/* --- Имена партнеров с подсказками (без изменений) --- */}
              {/* ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partner1Name" className="text-sm font-medium flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      Имя первого партнера
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Как вас зовут? (Или придумайте!) </p>
                         </TooltipContent>
                       </Tooltip>
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
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Имя вашего партнера (реальное или вымышленное)</p>
                         </TooltipContent>
                       </Tooltip>
                    </Label>
                    <Input
                      id="partner2Name" type="text" placeholder="Например, Эдвард"
                      value={partner2Name} onChange={(e) => setPartner2Name(e.target.value)}
                      className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
                    />
                  </div>
                </div>
              <Separator />

              {/* --- Блок вопросов (без изменений) --- */}
              {/* ... */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                  {selectedQuestions.map((question) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * parseInt(question.id.replace('question', '')) }}
                      className="space-y-2"
                    >
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
                          question.id === 'question6' ? question6Answer : ''
                        }
                        onChange={(e) => {
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
                    </motion.div>
                  ))}
              </div>
              <Separator />

              {/* --- Ключевые слова с подсказками (без изменений) --- */}
              {/* ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyword1" className="text-sm font-medium flex items-center">
                      Ключевое слово 1 (необязательно)
                      <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Добавьте слово или фразу (любимая еда, место, шутка), чтобы сделать историю уникальнее.</p>
                         </TooltipContent>
                       </Tooltip>
                    </Label>
                    <Input
                      id="keyword1" type="text" placeholder="Секретное прозвище, любимая еда..."
                      value={keyword1} onChange={(e) => setKeyword1(e.target.value)}
                      className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keyword2" className="text-sm font-medium flex items-center">
                      Ключевое слово 2 (необязательно)
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Еще одно слово или фраза для большей персонализации истории.</p>
                         </TooltipContent>
                       </Tooltip>
                    </Label>
                    <Input
                      id="keyword2" type="text" placeholder="Памятное место, общий мем..."
                      value={keyword2} onChange={(e) => setKeyword2(e.target.value)}
                      className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
                    />
                  </div>
              </div>
              <Separator />

              {/* --- Годы и Жанр с подсказками (без изменений) --- */}
              {/* ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="yearsTogether" className="text-sm font-medium flex items-center">
                      <Star className="mr-2 inline-block h-4 w-4 text-yellow-500" />
                      Сколько лет вы вместе?
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Число лет будет забавно вплетено в историю.</p>
                         </TooltipContent>
                       </Tooltip>
                    </Label>
                    <Input
                      id="yearsTogether" type="number" min="0" placeholder="Например, 5"
                      value={yearsTogether.toString()} onChange={(e) => setYearsTogether(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
                      className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0"
                    />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="genre" className="text-sm font-medium flex items-center">
                       Выберите тон / жанр истории
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>Задайте настроение вашей вымышленной истории.</p>
                         </TooltipContent>
                       </Tooltip>
                     </Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className="rounded-md shadow-sm focus:border-a020f0 focus:ring-a020f0">
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
              <Separator />

              {/* --- Кнопки действий (без изменений) --- */}
              {/* ... */}
              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isGenerating || !partner1Name || !partner2Name}
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
                 <Tooltip>
                   <TooltipTrigger asChild>
                      <Button
                        type="button"
                        onClick={generateRandomAnswers}
                        variant="outline"
                        className="flex-1 rounded-md shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary-500 py-3 text-base"
                      >
                        Удиви меня! (Случайные ответы)
                      </Button>
                   </TooltipTrigger>
                   <TooltipContent>
                      <p>Заполнить все поля (кроме имен) случайными смешными вариантами.</p>
                   </TooltipContent>
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
                    // Убрали ref отсюда
                  >
                    <Label htmlFor="alternativeStoryOutput" className="text-base font-semibold text-a020f0">
                      Ваша альтернативная история:
                    </Label>
                    {/* Добавили ref сюда */}
                    <p id="alternativeStoryOutput" ref={storyTextRef} className={cn("story-text whitespace-pre-wrap", storyGenreClass)}>
                      {alternativeStory}
                    </p>
                    {/* Удалили кнопку "Скопировать HTML" */}
                    <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-center pt-2">
                      {currentUser && (
                        <Button onClick={handleSaveStory} disabled={isSaving} className="min-w-[160px] bg-green-600 hover:bg-green-700 text-white">
                          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
                          Сохранить
                        </Button>
                      )}
                       <Button onClick={copyToClipboard} className="min-w-[160px]" variant="outline">
                         <Copy className="mr-2 h-4 w-4" />
                         Скопировать текст
                       </Button>
                      {/* Кнопка Поделиться */}
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button onClick={shareStory} className="min-w-[160px]" variant="outline" disabled={!alternativeStory}>
                                  <Share2 className="mr-2 h-4 w-4" />
                                  Поделиться
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                              <p>{typeof navigator.share !== 'undefined' ? 'Поделиться через стандартное меню ОС' : 'Скопировать текст (функция "Поделиться" недоступна)'}</p>
                          </TooltipContent>
                      </Tooltip>
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
