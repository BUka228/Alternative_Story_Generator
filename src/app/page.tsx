'use client';

import {generateAlternativeStory} from '@/ai/flows/generate-alternative-story';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {useState, useRef, useEffect} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Copy, User, Star, Share2, Heart} from 'lucide-react';
import {useToast} from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookOpen, Clapperboard, Dumbbell, Gem, Ghost, Microscope, Tent, Tv } from 'lucide-react';
import {auth} from "@/firebase/firebaseConfig";
import {signOut} from "firebase/auth";
import { useRouter } from 'next/navigation';

const questions = {
  firstImpression: [
    {
      id: 'question1',
      text: 'Где вы впервые НЕ встретились?',
    },
    {
      id: 'question2',
      text: 'Какое кодовое слово чуть НЕ стало началом вашей дружбы?',
    },
    {
      id: 'question3',
      text: 'Что вы точно НЕ надели бы на первое свидание?',
    },
  ],
  awkwardMoments: [
    {
      id: 'question4',
      text: 'Что самое абсурдное вы точно НЕ делали вместе?',
    },
    {
      id: 'question5',
      text: 'Какое животное ни в коем случае НЕ стало вашим питомцем?',
    },
    {
      id: 'question6',
      text: 'Что ни в коем случае НЕ было забыто в важный момент?',
    },
  ],
  hiddenTalents: [
    {
      id: 'question7',
      text: 'Какое супер-умение НЕ пригодилось вам в первый год?',
    },
    {
      id: 'question8',
      text: 'Какое умение вы точно НЕ использовали, чтобы впечатлить друг друга?',
    },
     {
      id: 'question9',
      text: 'Какой талант точно НЕ помог вам избежать катастрофы?',
    },
  ],
  randomEvents: [
    {
      id: 'question10',
      text: 'Что вы точно НЕ делали вместе на первом свидании?',
    },
    {
      id: 'question11',
      text: 'Какое странное хобби точно НЕ стало вашим общим?',
    },
  ]
};

const crazyAnswers = {
  question1: ['На вершине Эвереста во время чаепития', 'Внутри гигантского пончика', 'Во время телепортации в разные вселенные'],
  question2: ['Фиолетовый нарвал шепчет', 'Банановая сингулярность', 'Электромагнитный импульс любви'],
  question3: ['Костюм банана', 'Платье из воздушных шаров', 'Шлем из фольги'],
  question4: ['Прыгали с парашютом', 'Играли в шахматы под водой', 'Участвовали в гонках на тракторах'],
  question5: ['Динозавр', 'Феникс', 'Гигантский муравей'],
  question6: ['Зонтик в солнечный день', 'Запасной скафандр', 'Инструкция по выживанию в зомби-апокалипсисе'],
  question7: ['Левитация тостеров', 'Чтение мыслей камней', 'Мгновенная телепортация носков'],
  question8: ['Поедание стекла', 'Разговор с дельфинами', 'Создание порталов в другие измерения'],
   question9: ['Управление погодой', 'Телепортация', 'Предвидение будущего'],
  question10: ['Прыгали с парашютом', 'Играли в шахматы под водой', 'Участвовали в гонках на тракторах'],
  question11: ['Коллекционирование пуговиц', 'Выращивание светящихся грибов', 'Строительство замков из песка в космосе'],
};

const genreIcons = {
    "Смешная": Dumbbell,
    "Фантастическая": Tent,
    "Романтическая (с иронией)": Heart,
    "Как в кино": Clapperboard,
    "Научная фантастика": Microscope,
    "Сказка": BookOpen,
    "Детектив": User,
    "Хоррор (юмористический)": Ghost,
};

export default function Home() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [genre, setGenre] = useState('Смешная');
  const {toast} = useToast();
  const storyRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (alternativeStory && storyRef.current) {
      storyRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [alternativeStory]);

  const handleSubmit = async () => {
    setIsLoading(true);
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
        yearsTogether,
        genre,
      });
      setAlternativeStory(result.alternativeStory);
    } catch (error) {
      console.error('Failed to generate story:', error);
      setAlternativeStory('Произошла ошибка при генерации истории.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomAnswers = () => {
    const answers = Object.values(crazyAnswers);
    setQuestion1Answer(answers[0][Math.floor(Math.random() * answers[0].length)]);
    setQuestion2Answer(answers[1][Math.floor(Math.random() * answers[1].length)]);
    setQuestion3Answer(answers[2][Math.floor(Math.random() * answers[2].length)]);
    setQuestion4Answer(answers[3][Math.floor(Math.random() * answers[3].length)]);
    setQuestion5Answer(answers[4][Math.floor(Math.random() * answers[4].length)]);
     setQuestion6Answer(answers[5][Math.floor(Math.random() * answers[5].length)]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(alternativeStory).then(() => {
      toast({
        title: "История скопирована!",
        description: "Теперь вы можете поделиться ею где угодно.",
      });
    }).catch(err => {
      toast({
        title: "Ошибка копирования",
        description: "Не удалось скопировать историю. Попробуйте еще раз.",
        variant: "destructive",
      });
      console.error("Failed to copy text: ", err);
    });
  };


  const shareStory = async () => {
    const shareData = {
      title: 'История Наоборот',
      text: `История Наоборот:\n\n${alternativeStory}\n\nПопробуйте создать свою историю: ${window.location.href}`,
      url: window.location.href, // Current page URL
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Отправлено!",
          description: "История отправлена!",
        });
        console.log('Shared successfully');
      } catch (error) {
        console.error('Sharing failed:', error);
      }
    } else {
      copyToClipboard();
    }
  };

 const selectedQuestions = [
    ...questions.firstImpression,
    ...questions.awkwardMoments,
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-f0f8ff" style={{
        backgroundImage: 'url("/bg.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}>
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
              <User className="h-4 w-4" />
              <span className="sr-only">Open user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem >
              Профиль
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => {
              await signOut(auth);
              router.push('/');
            }}>
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card className="w-full max-w-5xl space-y-4 p-4 rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="title text-lg font-semibold text-center text-a020f0">История Наоборот</CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-center">
            Ответьте на вопросы, чтобы создать забавную альтернативную историю вашей встречи.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partner1Name" className="text-sm font-medium flex items-center">
                <User className="mr-2 h-4 w-4" />
                Имя первого партнера
              </Label>
              <Input
                id="partner1Name"
                type="text"
                placeholder="Имя"
                value={partner1Name}
                onChange={(e) => setPartner1Name(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner2Name" className="text-sm font-medium flex items-center">
                <User className="mr-2 h-4 w-4" />
                Имя второго партнера
              </Label>
              <Input
                id="partner2Name"
                type="text"
                placeholder="Имя"
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedQuestions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <Label htmlFor={question.id} className="text-sm font-medium">
                    {question.text}
                  </Label>
                  <Input
                    id={question.id}
                    type="text"
                    placeholder={crazyAnswers[question.id] ? crazyAnswers[question.id][0] : 'Ваш ответ'}
                    value={
                      question.id === 'question1' ? question1Answer :
                      question.id === 'question2' ? question2Answer :
                      question.id === 'question3' ? question3Answer :
                      question.id === 'question4' ? question4Answer :
                      question.id === 'question5' ? question5Answer :
                       question.id === 'question6' ? question6Answer : ''
                    }
                    onChange={(e) => {
                      if (question.id === 'question1') setQuestion1Answer(e.target.value);
                      else if (question.id === 'question2') setQuestion2Answer(e.target.value);
                      else if (question.id === 'question3') setQuestion3Answer(e.target.value);
                      else if (question.id === 'question4') setQuestion4Answer(e.target.value);
                      else if (question.id === 'question5') setQuestion5Answer(e.target.value);
                      else if (question.id === 'question6') setQuestion6Answer(e.target.value);
                    }}
                    className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
                  />
                </div>
              ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keyword1" className="text-sm font-medium">
                  Ключевое слово 1
                </Label>
                <Input
                  id="keyword1"
                  type="text"
                  placeholder="Секретное прозвище"
                  value={keyword1}
                  onChange={(e) => setKeyword1(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyword2" className="text-sm font-medium">
                  Ключевое слово 2
                </Label>
                <Input
                  id="keyword2"
                  type="text"
                  placeholder="Памятное место"
                  value={keyword2}
                  onChange={(e) => setKeyword2(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearsTogether" className="text-sm font-medium flex items-center">
                   <Star className="mr-2 inline-block h-4 w-4" />
                  Сколько лет вы вместе?
                </Label>
                <Input
                  id="yearsTogether"
                  type="number"
                  min="1"
                  placeholder="Количество лет"
                  value={yearsTogether.toString()}
                  onChange={(e) => setYearsTogether(Number(e.target.value))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genre" className="text-sm font-medium">
                  Выберите тон истории
                </Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0">
                    <SelectValue placeholder="Выберите тон истории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Смешная">
                      <div className="flex items-center">
                        <Dumbbell className="mr-2 h-4 w-4"/>
                        Смешная
                      </div>
                    </SelectItem>
                    <SelectItem value="Фантастическая">
                       <div className="flex items-center">
                        <Tent className="mr-2 h-4 w-4"/>
                        Фантастическая
                      </div>
                    </SelectItem>
                    <SelectItem value="Романтическая (с иронией)">
                       <div className="flex items-center">
                        <Heart className="mr-2 h-4 w-4"/>
                        Романтическая (с иронией)
                      </div>
                    </SelectItem>
                    <SelectItem value="Как в кино">
                       <div className="flex items-center">
                        <Clapperboard className="mr-2 h-4 w-4"/>
                        Как в кино
                      </div>
                    </SelectItem>
                     <SelectItem value="Научная фантастика">
                        <div className="flex items-center">
                          <Microscope className="mr-2 h-4 w-4"/>
                          Научная фантастика
                        </div>
                    </SelectItem>
                    <SelectItem value="Сказка">
                       <div className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4"/>
                        Сказка
                      </div>
                    </SelectItem>
                    <SelectItem value="Детектив">
                       <div className="flex items-center">
                        <User className="mr-2 h-4 w-4"/>
                        Детектив
                      </div>
                    </SelectItem>
                    <SelectItem value="Хоррор (юмористический)">
                       <div className="flex items-center">
                        <Ghost className="mr-2 h-4 w-4"/>
                        Хоррор (юмористический)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-x-2 md:space-y-0">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full md:w-auto bg-a020f0 text-white rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {isLoading ? (
                <>
                  Генерация истории...
                   <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-dashed border-white"></div>
                </>
              ) : (
                'Создать историю'
              )}
            </Button>

            <Button
              type="button"
              onClick={generateRandomAnswers}
              className="w-full md:w-auto rounded-md bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary-500"
            >
              Удиви меня!
            </Button>
          </div>

          {alternativeStory && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="alternativeStory" className="text-sm font-medium text-a020f0">
                Альтернативная история:
              </Label>
              <p className="story-text" ref={storyRef}>{alternativeStory}</p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-x-2">
                {navigator.share ? (
                  <Button onClick={shareStory} className="w-full rounded-md bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary-500">
                    <Share2 className="mr-2 h-4 w-4" />
                    Поделиться
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full rounded-md bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary-500">
                        <Share2 className="mr-2 h-4 w-4" />
                        Поделиться
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem onClick={copyToClipboard}>
                        <Copy className="mr-2 h-4 w-4" />
                        Скопировать текст
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button onClick={copyToClipboard} className="w-full rounded-md bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary-500">
                  <Copy className="mr-2 h-4 w-4" />
                  Скопировать текст
                </Button>
                <Button asChild variant="outline">
                  <a href="https://boosty.to/altigerg" target="_blank" rel="noopener noreferrer">
                    <Heart className="mr-2 h-4 w-4"/>
                    Поддержать автора
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

