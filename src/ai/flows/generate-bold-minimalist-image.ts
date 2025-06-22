'use server';
/**
 * @fileOverview Generates a bold minimalist image based on a post idea.
 *
 * - generateBoldMinimalistImage - A function that generates the image.
 * - GenerateBoldMinimalistImageInput - The input type for the generateBoldMinimalistImage function.
 * - GenerateBoldMinimalistImageOutput - The return type for the generateBoldMinimalistImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBoldMinimalistImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
});
export type GenerateBoldMinimalistImageInput = z.infer<
  typeof GenerateBoldMinimalistImageInputSchema
>;

const GenerateBoldMinimalistImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      'The generated bold minimalist image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'      
    ),
});
export type GenerateBoldMinimalistImageOutput = z.infer<
  typeof GenerateBoldMinimalistImageOutputSchema
>;

export async function generateBoldMinimalistImage(
  input: GenerateBoldMinimalistImageInput
): Promise<GenerateBoldMinimalistImageOutput> {
  return generateBoldMinimalistImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBoldMinimalistImagePrompt',
  input: {schema: GenerateBoldMinimalistImageInputSchema},
  output: {schema: GenerateBoldMinimalistImageOutputSchema},
  prompt: `Generate a bold minimalist image for the following social media post idea: {{{postIdea}}}. The image should be simple, impactful, and visually striking.`,
});

const generateBoldMinimalistImageFlow = ai.defineFlow(
  {
    name: 'generateBoldMinimalistImageFlow',
    inputSchema: GenerateBoldMinimalistImageInputSchema,
    outputSchema: GenerateBoldMinimalistImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.postIdea + ' in bold minimalist style',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('No image was generated.');
    }
    return {image: media.url!};
  }
);
