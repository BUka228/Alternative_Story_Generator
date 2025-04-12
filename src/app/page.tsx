'use client';

import {generateAlternativeStory} from '@/ai/flows/generate-alternative-story';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {useState} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Copy, Loader2, User} from 'lucide-react';

const questions = [
  {
    id: 'question1',
    text: 'Где вы впервые НЕ встретились?',
    options: ['На Луне', 'В жерле вулкана', 'На съезде любителей кактусов'],
  },
  {
    id: 'question2',
    text: 'Какое кодовое слово чуть НЕ стало началом вашей дружбы?',
    options: ['Абракадабра', 'Сим-Салабим', 'Квинтэссенция'],
  },
  {
    id: 'question3',
    text: 'Какое супер-умение НЕ пригодилось вам в первый год?',
    options: ['Левитация', 'Телепатия', 'Супер-скорость'],
  },
   {
    id: 'question4',
    text: 'Что вы точно НЕ делали вместе на первом свидании?',
    options: ['Кормили голубей', 'Танцевали танго', 'Разговаривали о философии'],
  },
  {
    id: 'question5',
    text: 'Какое животное ни в коем случае НЕ стало вашим питомцем?',
    options: ['Дракон', 'Единорог', 'Крокодил'],
  },
];

const crazyAnswers = {
  question1: ['На Марсе', 'В холодильнике', 'На лекции по квантовой физике'],
  question2: ['Рыба-меч', 'Фиолетовый бегемот', 'Синхрофазотрон'],
  question3: ['Левитация тостеров', 'Чтение мыслей камней', 'Мгновенная телепортация носков'],
  question4: ['Прыгали с парашютом', 'Играли в шахматы под водой', 'Участвовали в гонках на тракторах'],
  question5: ['Динозавр', 'Феникс', 'Гигантский муравей'],
};

export default function Home() {
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [question1Answer, setQuestion1Answer] = useState('');
  const [question2Answer, setQuestion2Answer] = useState('');
  const [question3Answer, setQuestion3Answer] = useState('');
  const [question4Answer, setQuestion4Answer] = useState('');
  const [question5Answer, setQuestion5Answer] = useState('');
  const [yearsTogether, setYearsTogether] = useState<number>(1);
  const [alternativeStory, setAlternativeStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [genre, setGenre] = useState('Смешная');

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
    setQuestion1Answer(crazyAnswers.question1[Math.floor(Math.random() * crazyAnswers.question1.length)]);
    setQuestion2Answer(crazyAnswers.question2[Math.floor(Math.random() * crazyAnswers.question2.length)]);
    setQuestion3Answer(crazyAnswers.question3[Math.floor(Math.random() * crazyAnswers.question3.length)]);
     setQuestion4Answer(crazyAnswers.question4[Math.floor(Math.random() * crazyAnswers.question4.length)]);
    setQuestion5Answer(crazyAnswers.question5[Math.floor(Math.random() * crazyAnswers.question5.length)]);
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(alternativeStory);
      alert('Текст скопирован!');
    } else {
      alert('Ваш браузер не поддерживает копирование в буфер обмена.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-f0f8ff">
      <Card className="w-full max-w-md space-y-4 p-4 rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="title text-lg font-semibold text-center text-a020f0">История Наоборот</CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-center">
            Ответьте на вопросы, чтобы создать забавную альтернативную историю вашей встречи.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator className="my-4" />
          <div className="space-y-2">
            <Label htmlFor="partner1Name" className="text-sm font-medium">
              <User className="mr-2 inline-block h-4 w-4" />
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
            <Label htmlFor="partner2Name" className="text-sm font-medium">
              <User className="mr-2 inline-block h-4 w-4" />
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
          {questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.id} className="text-sm font-medium">
                {question.text}
              </Label>
              <Input
                id={question.id}
                type="text"
                placeholder={question.id === 'question1' ? 'На вершине Эвереста во время чаепития' : question.id === 'question2' ? 'Фиолетовый нарвал шепчет' : question.id === 'question3' ? 'Левитация тостеров' : question.id === 'question4' ? 'Прыгали с парашютом' : 'Динозавр'}
                value={question.id === 'question1' ? question1Answer : question.id === 'question2' ? question2Answer : question.id === 'question3' ? question3Answer : question.id === 'question4' ? question4Answer : question5Answer}
                onChange={(e) => {
                  const value = e.target.value;
                  if (question.id === 'question1') {
                    setQuestion1Answer(value);
                  } else if (question.id === 'question2') {
                    setQuestion2Answer(value);
                  } else if (question.id === 'question3') {
                    setQuestion3Answer(value);
                  }  else if (question.id === 'question4') {
                    setQuestion4Answer(value);
                  } else {
                    setQuestion5Answer(value);
                  }
                }}
                className="rounded-md border-gray-300 shadow-sm focus:border-a020f0 focus:ring-a020f0"
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="yearsTogether" className="text-sm font-medium">
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
                <SelectItem value="Смешная">Смешная</SelectItem>
                <SelectItem value="Фантастическая">Фантастическая</SelectItem>
                <SelectItem value="Романтическая (с иронией)">Романтическая (с иронией)</SelectItem>
                <SelectItem value="Как в кино">Как в кино</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-a020f0 text-white rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {isLoading ? (
              <>
                Генерация истории...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Создать историю'
            )}
          </Button>

          <Button
            type="button"
            onClick={generateRandomAnswers}
            className="mt-2 w-full rounded-md bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary-500"
          >
            Удиви меня!
          </Button>

          {alternativeStory && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="alternativeStory" className="text-sm font-medium text-a020f0">
                Альтернативная история:
              </Label>
              <div className="p-3 rounded-md bg-gray-100 text-gray-800">
                {alternativeStory}
              </div>
              <Button onClick={copyToClipboard} className="w-full rounded-md bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary-500">
                <Copy className="mr-2 h-4 w-4" />
                Скопировать текст
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
