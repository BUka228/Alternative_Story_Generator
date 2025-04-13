
'use server';

/**
 * @fileOverview Generates a humorous, alternative backstory of how a couple met.
 *
 * - generateAlternativeStory - A function that generates the alternative story.
 * - GenerateAlternativeStoryInput - The input type for the generateAlternativeStory function.
 * - GenerateAlternativeStoryOutput - The return type for the generateAlternativeStory function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Обновляем схему ввода, добавляя новые поля
const GenerateAlternativeStoryInputSchema = z.object({
  partner1Name: z.string().describe('The name of the first partner.'),
  partner2Name: z.string().describe('The name of the second partner.'),
  partner1PetName: z.string().optional().describe('Optional pet name/term of endearment for the first partner (e.g., Котик, Зайка).'), // Новое поле
  partner2PetName: z.string().optional().describe('Optional pet name/term of endearment for the second partner (e.g., Солнце, Рыбка).'), // Новое поле
  question1Answer: z.string().describe('Answer to the first multiple-choice question.'),
  question2Answer: z.string().describe('Answer to the second multiple-choice question.'),
  question3Answer: z.string().describe('Answer to the third multiple-choice question.'),
  question4Answer: z.string().describe('Answer to the fourth multiple-choice question.'),
  question5Answer: z.string().describe('Answer to the fifth multiple-choice question.'),
  question6Answer: z.string().describe('Answer to the sixth multiple-choice question.'),
  question7Answer: z.string().describe('Answer to the seventh multiple-choice question.'), // Новое поле
  question8Answer: z.string().describe('Answer to the eighth multiple-choice question.'), // Новое поле
  keyword1: z.string().optional().describe('Optional keyword or phrase for personalization.'),
  keyword2: z.string().optional().describe('Optional second keyword or phrase for personalization.'),
  keyword3: z.string().optional().describe('Optional third keyword or phrase for personalization.'), // Новое поле
  yearsTogether: z.number().describe('The number of years the couple has been together.'),
  genre: z.string().describe('The genre or tone of the story (e.g., Смешная, Фантастическая, Романтическая (с иронией), Как в кино, Научная фантастика, Сказка, Детектив, Хоррор (юмористический), Шпионский боевик, Вестерн, Нуар).'), // Обновили список жанров
});
export type GenerateAlternativeStoryInput = z.infer<typeof GenerateAlternativeStoryInputSchema>;

// Схема вывода остается без изменений
const GenerateAlternativeStoryOutputSchema = z.object({
  alternativeStory: z.string().describe('A humorous, fictional alternative story of how the pair met.'),
});
export type GenerateAlternativeStoryOutput = z.infer<typeof GenerateAlternativeStoryOutputSchema>;

// Функция-обертка остается без изменений
export async function generateAlternativeStory(input: GenerateAlternativeStoryInput): Promise<GenerateAlternativeStoryOutput> {
  return generateAlternativeStoryFlow(input);
}

// Обновляем сам промпт
const prompt = ai.definePrompt({
  name: 'generateAlternativeStoryPrompt',
  input: {
    schema: z.object({ // Копируем обновленную схему сюда для ясности (хотя можно и ссылаться)
        partner1Name: z.string().describe('The name of the first partner.'),
        partner2Name: z.string().describe('The name of the second partner.'),
        partner1PetName: z.string().optional().describe('Optional pet name/term of endearment for the first partner.'),
        partner2PetName: z.string().optional().describe('Optional pet name/term of endearment for the second partner.'),
        question1Answer: z.string().describe('Answer to question 1.'),
        question2Answer: z.string().describe('Answer to question 2.'),
        question3Answer: z.string().describe('Answer to question 3.'),
        question4Answer: z.string().describe('Answer to question 4.'),
        question5Answer: z.string().describe('Answer to question 5.'),
        question6Answer: z.string().describe('Answer to question 6.'),
        question7Answer: z.string().describe('Answer to question 7.'),
        question8Answer: z.string().describe('Answer to question 8.'),
        keyword1: z.string().optional().describe('Optional keyword 1.'),
        keyword2: z.string().optional().describe('Optional keyword 2.'),
        keyword3: z.string().optional().describe('Optional keyword 3.'),
        yearsTogether: z.number().describe('Years together.'),
        genre: z.string().describe('Story genre/tone.'),
    }),
  },
  output: {
    schema: z.object({
      alternativeStory: z.string().describe('A humorous, fictional alternative story of how the pair met.'),
    }),
  },
  // Обновленный текст промпта
  prompt: `You are a creative writer specializing in humorous and fictional stories in Russian.

  Generate a short, funny, and completely made-up "alternative story" of how {{partner1Name}} and {{partner2Name}} met. Base the story on their answers to the multiple-choice questions, the number of years they've been together ({{{yearsTogether}}}), and the selected genre ("{{{genre}}}").

  **Instructions:**
  *   The story MUST be in Russian.
  *   Be creative, unexpected, and humorous.
  *   Incorporate the number of years ({{{yearsTogether}}}) into the story in a funny or relevant way.
  *   Adhere strictly to the requested genre: "{{{genre}}}".
  *   **Use the provided answers (even if they seem absurd) as inspiration points for the plot.**
  *   **If pet names (partner1PetName, partner2PetName) are provided, try to weave them into the dialogue or narrative naturally and humorously.** For example, one partner might call the other by their pet name in a funny situation.
  *   **Try to incorporate the provided keywords (keyword1, keyword2, keyword3) to make the story more unique and personal.**

  **Input Data:**
  Partner 1 Name: {{partner1Name}}
  Partner 2 Name: {{partner2Name}}
  {{#if partner1PetName}}Partner 1 Pet Name: {{partner1PetName}}{{/if}}
  {{#if partner2PetName}}Partner 2 Pet Name: {{partner2PetName}}{{/if}}
  Years Together: {{{yearsTogether}}}
  Genre: {{{genre}}}

  Question 1 Answer (Where they did NOT meet): {{{question1Answer}}}
  Question 2 Answer (Codeword NOT used): {{{question2Answer}}}
  Question 3 Answer (What they would NOT wear): {{{question3Answer}}}
  Question 4 Answer (Absurd thing NOT done): {{{question4Answer}}}
  Question 5 Answer (Animal NOT their pet): {{{question5Answer}}}
  Question 6 Answer (Thing NOT forgotten): {{{question6Answer}}}
  Question 7 Answer (Superpower they WON'T have): {{{question7Answer}}}
  Question 8 Answer (Planet they WON'T honeymoon on): {{{question8Answer}}}

  {{#if keyword1}}Keyword 1: {{{keyword1}}}{{/if}}
  {{#if keyword2}}Keyword 2: {{{keyword2}}}{{/if}}
  {{#if keyword3}}Keyword 3: {{{keyword3}}}{{/if}}

  **Generated Alternative Story (in Russian):**
  `,
});

// Флоу остается таким же, используя обновленный промпт
const generateAlternativeStoryFlow = ai.defineFlow<
  typeof GenerateAlternativeStoryInputSchema,
  typeof GenerateAlternativeStoryOutputSchema
>({
  name: 'generateAlternativeStoryFlow',
  inputSchema: GenerateAlternativeStoryInputSchema,
  outputSchema: GenerateAlternativeStoryOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
