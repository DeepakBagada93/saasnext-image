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
  prompt: `Create a 1:1 square social media post for this idea: "{{{postIdea}}}".

Follow these detailed style and layout instructions:

✨ Design Aesthetic:
- Bold and minimalist.
- Premium, modern business look.
- Inspired by magazine advertisements.

🎨 Color Palette:
- Background: Solid navy blue (#001F3F) with a subtle abstract noise or a soft diagonal texture at about 5% opacity.
- Arrow: A large, upward-pointing arrow in vibrant orange (#FF6A00), positioned in the center.
- Headline Text: White (#FFFFFF), all caps, and bold.
- Supporting Text: A clean, modern font in light gray (#D3D3D3).
- CTA Button: A pill-shaped button with an orange (#FF6A00) background and white (#FFFFFF) text.

📍 Layout & Content (Based on the user's idea):
- Headline: Extract the main headline from the user's idea. Place it at the top-left or top-center. It should be large.
- Supporting Text: Extract the supporting text from the user's idea. Place it directly below the headline.
- CTA Button: Create a call-to-action button in the bottom-right corner. Use a CTA phrase from the user's idea.

🧩 Optional Extras:
- Icons: Include subtle, white, line-style icons (e.g., megaphone, chart, email) near the central arrow with about 20% opacity.
- Underline: Add a thin, orange (#FF6A00) underline beneath the headline for an editorial touch.`,
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
      prompt: `Create a 1:1 square social media post for this idea: "${input.postIdea}".

Follow these detailed style and layout instructions:

✨ Design Aesthetic:
- Bold and minimalist.
- Premium, modern business look.
- Inspired by magazine advertisements.

🎨 Color Palette:
- Background: Solid navy blue (#001F3F) with a subtle abstract noise or a soft diagonal texture at about 5% opacity.
- Arrow: A large, upward-pointing arrow in vibrant orange (#FF6A00), positioned in the center.
- Headline Text: White (#FFFFFF), all caps, and bold.
- Supporting Text: A clean, modern font in light gray (#D3D3D3).
- CTA Button: A pill-shaped button with an orange (#FF6A00) background and white (#FFFFFF) text.

📍 Layout & Content (Based on the user's idea):
- Headline: Extract the main headline from the user's idea. Place it at the top-left or top-center. It should be large.
- Supporting Text: Extract the supporting text from the user's idea. Place it directly below the headline.
- CTA Button: Create a call-to-action button in the bottom-right corner. Use a CTA phrase from the user's idea.

🧩 Optional Extras:
- Icons: Include subtle, white, line-style icons (e.g., megaphone, chart, email) near the central arrow with about 20% opacity.
- Underline: Add a thin, orange (#FF6A00) underline beneath the headline for an editorial touch.`,
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
