'use server';

/**
 * @fileOverview A flow to summarize pilgrim feedback data for a specific Ghat.
 *
 * - summarizeGhatFeedback - A function that takes a Ghat name and feedback data and generates a summary report.
 * - SummarizeGhatFeedbackInput - The input type for the summarizeGhatFeedback function.
 * - SummarizeGhatFeedbackOutput - The return type for the summarizeGhatFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeGhatFeedbackInputSchema = z.object({
  ghatName: z.string().describe('The name of the Ghat for which to summarize feedback.'),
  feedbackData: z.array(z.string()).describe('An array of strings, where each string is a pilgrim feedback comment.'),
});
export type SummarizeGhatFeedbackInput = z.infer<typeof SummarizeGhatFeedbackInputSchema>;

const SummarizeGhatFeedbackOutputSchema = z.object({
  summaryReport: z.string().describe('A summary report highlighting key issues and positive aspects from the feedback data.'),
});
export type SummarizeGhatFeedbackOutput = z.infer<typeof SummarizeGhatFeedbackOutputSchema>;

export async function summarizeGhatFeedback(input: SummarizeGhatFeedbackInput): Promise<SummarizeGhatFeedbackOutput> {
  return summarizeGhatFeedbackFlow(input);
}

const summarizeGhatFeedbackPrompt = ai.definePrompt({
  name: 'summarizeGhatFeedbackPrompt',
  input: {schema: SummarizeGhatFeedbackInputSchema},
  output: {schema: SummarizeGhatFeedbackOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing pilgrim feedback for Ghats during the Kumbh Mela.

  Your goal is to identify key issues and positive aspects from the provided feedback data and generate a concise summary report that will help administrators improve the pilgrim experience.

  Ghat Name: {{ghatName}}

  Feedback Data:
  {{#each feedbackData}}
  - {{{this}}}
  {{/each}}

  Please provide a summary report that highlights the main themes, recurring issues, and positive comments found in the feedback data. The report should be no more than 200 words.
  Follow this format:
  **Summary Report:**
  [Summary of key issues and positive aspects] `,
});

const summarizeGhatFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeGhatFeedbackFlow',
    inputSchema: SummarizeGhatFeedbackInputSchema,
    outputSchema: SummarizeGhatFeedbackOutputSchema,
  },
  async input => {
    const {output} = await summarizeGhatFeedbackPrompt(input);
    return output!;
  }
);
