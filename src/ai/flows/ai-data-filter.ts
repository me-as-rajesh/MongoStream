// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview AI-powered data filtering flow for MongoDB collections.
 *
 * - aiDataFilter - A function that translates natural language queries into MongoDB queries and returns matching documents.
 * - AiDataFilterInput - The input type for the aiDataFilter function.
 * - AiDataFilterOutput - The return type for the aiDataFilter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDataFilterInputSchema = z.object({
  naturalLanguageQuery: z
    .string()
    .describe('A natural language query describing the desired data.'),
  collectionSchema: z
    .string()
    .describe('The schema of the MongoDB collection as a JSON string.'),
  collectionName: z.string().describe('The name of the MongoDB collection.'),
});
export type AiDataFilterInput = z.infer<typeof AiDataFilterInputSchema>;

const AiDataFilterOutputSchema = z.object({
  mongoQuery: z
    .string()
    .describe('The MongoDB query translated from the natural language query.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the generated MongoDB query.'),
});
export type AiDataFilterOutput = z.infer<typeof AiDataFilterOutputSchema>;

export async function aiDataFilter(input: AiDataFilterInput): Promise<AiDataFilterOutput> {
  return aiDataFilterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDataFilterPrompt',
  input: {schema: AiDataFilterInputSchema},
  output: {schema: AiDataFilterOutputSchema},
  prompt: `You are an expert at translating natural language queries into MongoDB queries.

You will be provided with a natural language query, the schema of a MongoDB collection, and the name of the collection.

Your task is to translate the natural language query into a MongoDB query that will return the documents that match the query.

Respond in JSON format.

Here is the schema of the MongoDB collection: {{{collectionSchema}}}

Here is the natural language query: {{{naturalLanguageQuery}}}

Collection Name: {{{collectionName}}}

{
  "mongoQuery": "<insert MongoDB query here>",
    "reasoning": "<Reasoning for the mongo query>"
}
`,
});

const aiDataFilterFlow = ai.defineFlow(
  {
    name: 'aiDataFilterFlow',
    inputSchema: AiDataFilterInputSchema,
    outputSchema: AiDataFilterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
