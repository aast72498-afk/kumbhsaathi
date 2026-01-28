import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-optimal-ghat.ts';
import '@/ai/flows/generate-devotional-message.ts';
import '@/ai/flows/summarize-ghat-feedback.ts';