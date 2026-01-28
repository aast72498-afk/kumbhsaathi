'use server';

/**
 * @fileOverview Generates a personalized devotional message based on the selected Ghat and time of day.
 *
 * - generateDevotionalMessage - A function that generates the devotional message.
 * - DevotionalMessageInput - The input type for the generateDevotionalMessage function.
 * - DevotionalMessageOutput - The return type for the generateDevotionalMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DevotionalMessageInputSchema = z.object({
  ghatName: z.string().describe('The name of the selected Ghat.'),
  timeOfDay: z.string().describe('The time of day for the visit (e.g., morning, afternoon, evening).'),
  userName: z.string().describe('The name of the user.'),
});

export type DevotionalMessageInput = z.infer<typeof DevotionalMessageInputSchema>;

const DevotionalMessageOutputSchema = z.object({
  message: z.string().describe('The personalized devotional message.'),
});

export type DevotionalMessageOutput = z.infer<typeof DevotionalMessageOutputSchema>;

export async function generateDevotionalMessage(input: DevotionalMessageInput): Promise<DevotionalMessageOutput> {
  return generateDevotionalMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'devotionalMessagePrompt',
  input: {schema: DevotionalMessageInputSchema},
  output: {schema: DevotionalMessageOutputSchema},
  prompt: `You are a devotional guide, creating personalized messages for pilgrims.

  Craft a short, uplifting message for {{userName}} visiting {{ghatName}} in the {{timeOfDay}}.
  The message should evoke a sense of peace, devotion, and connection to the divine.

  Example:
  "Dear Pilgrim, may your visit to the holy {{ghatName}} in the serene {{timeOfDay}} bring you closer to enlightenment."
  `,
});

const generateDevotionalMessageFlow = ai.defineFlow(
  {
    name: 'generateDevotionalMessageFlow',
    inputSchema: DevotionalMessageInputSchema,
    outputSchema: DevotionalMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
