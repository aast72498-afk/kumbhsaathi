'use server';

/**
 * @fileOverview An AI agent that suggests the least crowded Ghat and time slot.
 *
 * - suggestOptimalGhat - A function that suggests the optimal Ghat.
 * - SuggestOptimalGhatInput - The input type for the suggestOptimalGhat function.
 * - SuggestOptimalGhatOutput - The return type for the suggestOptimalGhat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalGhatInputSchema = z.object({
  date: z.string().describe('The date for which the Ghat suggestion is needed.'),
  numberOfPeople: z
    .number()
    .describe('The number of people in the pilgrim group.'),
});
export type SuggestOptimalGhatInput = z.infer<typeof SuggestOptimalGhatInputSchema>;

const SuggestOptimalGhatOutputSchema = z.object({
  ghatName: z.string().describe('The name of the suggested Ghat.'),
  timeSlot: z.string().describe('The suggested time slot for the Ghat.'),
  crowdLevel: z
    .string()
    .describe(
      'The predicted crowd level (e.g., Low, Medium, High) for the suggested Ghat and time slot.'
    ),
  reason: z.string().describe('The reason for suggesting this ghat'),
});
export type SuggestOptimalGhatOutput = z.infer<typeof SuggestOptimalGhatOutputSchema>;

export async function suggestOptimalGhat(input: SuggestOptimalGhatInput): Promise<SuggestOptimalGhatOutput> {
  return suggestOptimalGhatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalGhatPrompt',
  input: {schema: SuggestOptimalGhatInputSchema},
  output: {schema: SuggestOptimalGhatOutputSchema},
  prompt: `You are an AI assistant that suggests the least crowded Ghat and time slot for pilgrims based on the provided date and number of people.

  Date: {{{date}}}
  Number of People: {{{numberOfPeople}}}

  Consider factors such as real-time data, predicted occupancy, and historical trends to provide the best suggestion for a peaceful and convenient experience.
  Return the ghatName, timeSlot, crowdLevel and a short reason why.
`,
});

const suggestOptimalGhatFlow = ai.defineFlow(
  {
    name: 'suggestOptimalGhatFlow',
    inputSchema: SuggestOptimalGhatInputSchema,
    outputSchema: SuggestOptimalGhatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
