'use client';

import {generateAlternativeStory} from '@/ai/flows/generate-alternative-story';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {useState} from 'react';

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
];

export default function Home() {
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [question1Answer, setQuestion1Answer] = useState('');
  const [question2Answer, setQuestion2Answer] = useState('');
  const [question3Answer, setQuestion3Answer] = useState('');
  const [yearsTogether, setYearsTogether] = useState<number>(0);
  const [alternativeStory, setAlternativeStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await generateAlternativeStory({
        partner1Name,
        partner2Name,
        question1Answer,
        question2Answer,
        question3Answer,
        yearsTogether,
      });
      setAlternativeStory(result.alternativeStory);
    } catch (error) {
      console.error('Failed to generate story:', error);
      setAlternativeStory('Произошла ошибка при генерации истории.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-f0f8ff">
      <Card className="w-full max-w-md space-y-4 p-4 rounded-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-center">История Наоборот</CardTitle>
          <CardDescription className="text-sm text-muted-foreground text-center">
            Ответьте на вопросы, чтобы создать забавную альтернативную историю вашей встречи.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="partner1Name" className="text-sm font-medium">
              Имя первого партнера
            </Label>
            <Input
              id="partner1Name"
              type="text"
              placeholder="Имя"
              value={partner1Name}
              onChange={(e) => setPartner1Name(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partner2Name" className="text-sm font-medium">
              Имя второго партнера
            </Label>
            <Input
              id="partner2Name"
              type="text"
              placeholder="Имя"
              value={partner2Name}
              onChange={(e) => setPartner2Name(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
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
                placeholder={question.id === 'question1' ? 'На Марсе, В холодильнике, На лекции по квантовой физике' : question.id === 'question2' ? 'Рыба-меч, Фиолетовый бегемот, Синхрофазотрон' : 'Левитация тостеров, Чтение мыслей камней, Мгновенная телепортация носков'}
                value={question.id === 'question1' ? question1Answer : question.id === 'question2' ? question2Answer : question3Answer}
                onChange={(e) => {
                  const value = e.target.value;
                  if (question.id === 'question1') {
                    setQuestion1Answer(value);
                  } else if (question.id === 'question2') {
                    setQuestion2Answer(value);
                  } else {
                    setQuestion3Answer(value);
                  }
                }}
                className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
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
              className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-a020f0 text-white rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {isLoading ? 'Генерация истории...' : 'Создать историю'}
          </Button>
          {alternativeStory && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="alternativeStory" className="text-sm font-medium">
                Альтернативная история:
              </Label>
              <div className="p-3 rounded-md bg-gray-100 text-gray-800">
                {alternativeStory}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
