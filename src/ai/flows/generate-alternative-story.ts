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

const GenerateAlternativeStoryInputSchema = z.object({
  partner1Name: z.string().describe('The name of the first partner.'),
  partner2Name: z.string().describe('The name of the second partner.'),
  question1Answer: z.string().describe('Answer to the first multiple-choice question.'),
  question2Answer: z.string().describe('Answer to the second multiple-choice question.'),
  question3Answer: z.string().describe('Answer to the third multiple-choice question.'),
  yearsTogether: z.number().describe('The number of years the couple has been together.'),
});
export type GenerateAlternativeStoryInput = z.infer<typeof GenerateAlternativeStoryInputSchema>;

const GenerateAlternativeStoryOutputSchema = z.object({
  alternativeStory: z.string().describe('A humorous, fictional alternative story of how the pair met.'),
});
export type GenerateAlternativeStoryOutput = z.infer<typeof GenerateAlternativeStoryOutputSchema>;

export async function generateAlternativeStory(input: GenerateAlternativeStoryInput): Promise<GenerateAlternativeStoryOutput> {
  return generateAlternativeStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAlternativeStoryPrompt',
  input: {
    schema: z.object({
      partner1Name: z.string().describe('The name of the first partner.'),
      partner2Name: z.string().describe('The name of the second partner.'),
      question1Answer: z.string().describe('Answer to the first multiple-choice question.'),
      question2Answer: z.string().describe('Answer to the second multiple-choice question.'),
      question3Answer: z.string().describe('Answer to the third multiple-choice question.'),
      yearsTogether: z.number().describe('The number of years the couple has been together.'),
    }),
  },
  output: {
    schema: z.object({
      alternativeStory: z.string().describe('A humorous, fictional alternative story of how the pair met.'),
    }),
  },
  prompt: `You are a creative writer specializing in humorous and fictional stories.

  Based on the provided answers to the multiple-choice questions and the number of years the couple has been together, generate a short, funny, and completely made-up "alternative story" of how {{partner1Name}} and {{partner2Name}} met. Be creative and unexpected.  Incorporate the number of years ({{{yearsTogether}}}) into the story in a funny way. The story should be in Russian.

  Question 1 Answer: {{{question1Answer}}}
  Question 2 Answer: {{{question2Answer}}}
  Question 3 Answer: {{{question3Answer}}}

  Alternative Story:`, 
});

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
