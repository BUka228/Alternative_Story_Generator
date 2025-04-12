'use client';

import {generateAlternativeStory} from '@/ai/flows/generate-alternative-story';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {useState} from 'react';
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

const questions = [
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
    text: 'Какое супер-умение НЕ пригодилось вам в первый год?',
  },
   {
    id: 'question4',
    text: 'Что вы точно НЕ делали вместе на первом свидании?',
  },
  {
    id: 'question5',
    text: 'Какое животное ни в коем случае НЕ стало вашим питомцем?',
  },
];

const crazyAnswers = {
  question1: ['На вершине Эвереста во время чаепития', 'Внутри гигантского пончика', 'Во время телепортации в разные вселенные'],
  question2: ['Фиолетовый нарвал шепчет', 'Банановая сингулярность', 'Электромагнитный импульс любви'],
  question3: ['Левитация тостеров', 'Чтение мыслей камней', 'Мгновенная телепортация носков'],
  question4: ['Прыгали с парашютом', 'Играли в шахматы под водой', 'Участвовали в гонках на тракторах'],
  question5: ['Динозавр', 'Феникс', 'Гигантский муравей'],
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
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');
  const [yearsTogether, setYearsTogether] = useState<number>(1);
  const [alternativeStory, setAlternativeStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [genre, setGenre] = useState('Смешная');
  const {toast} = useToast();

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


  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-f0f8ff" style={{
        backgroundImage: 'url("/bg.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}>
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
              <div className="space-y-2">
                <Label htmlFor="question1" className="text-sm font-medium">
                  {questions[0].text}
                </Label>
                <Input
                  id="question1"
                  type="text"
                  placeholder="На вершине Эвереста во время чаепития"
                  value={question1Answer}
                  onChange={(e) => setQuestion1Answer(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question2" className="text-sm font-medium">
                  {questions[1].text}
                </Label>
                <Input
                  id="question2"
                  type="text"
                  placeholder="Фиолетовый нарвал шепчет"
                  value={question2Answer}
                  onChange={(e) => setQuestion2Answer(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="question3" className="text-sm font-medium">
                  {questions[2].text}
                </Label>
                <Input
                  id="question3"
                  type="text"
                  placeholder="Левитация тостеров"
                  value={question3Answer}
                  onChange={(e) => setQuestion3Answer(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>

               <div className="space-y-2">
                <Label htmlFor="question4" className="text-sm font-medium">
                  {questions[3].text}
                </Label>
                <Input
                  id="question4"
                  type="text"
                  placeholder="Прыгали с парашютом"
                  value={question4Answer}
                  onChange={(e) => setQuestion4Answer(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="question5" className="text-sm font-medium">
                  {questions[4].text}
                </Label>
                <Input
                  id="question5"
                  type="text"
                  placeholder="Динозавр"
                  value={question5Answer}
                  onChange={(e) => setQuestion5Answer(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
                />
              </div>

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
                  <Dumbbell className="mr-2 h-4 w-4"/>
                  Смешная
                </SelectItem>
                <SelectItem value="Фантастическая">
                  <Tent className="mr-2 h-4 w-4"/>
                  Фантастическая
                </SelectItem>
                <SelectItem value="Романтическая (с иронией)">
                  <Heart className="mr-2 h-4 w-4"/>
                  Романтическая (с иронией)
                </SelectItem>
                <SelectItem value="Как в кино">
                  <Clapperboard className="mr-2 h-4 w-4"/>
                  Как в кино
                </SelectItem>
                 <SelectItem value="Научная фантастика">
                  <Microscope className="mr-2 h-4 w-4"/>
                  Научная фантастика
                </SelectItem>
                <SelectItem value="Сказка">
                  <BookOpen className="mr-2 h-4 w-4"/>
                  Сказка
                </SelectItem>
                <SelectItem value="Детектив">
                  <User className="mr-2 h-4 w-4"/>
                  Детектив
                </SelectItem>
                <SelectItem value="Хоррор (юмористический)">
                  <Ghost className="mr-2 h-4 w-4"/>
                  Хоррор (юмористический)
                </SelectItem>
              </SelectContent>
            </Select>
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
              <p className="story-text">{alternativeStory}</p>
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
