'use server';
/**
 * @fileOverview Generates a bold minimalist image based on a post idea.
 *
 * - generateBoldMinimalistImage - A function that generates the image and its text content.
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

const TextContentSchema = z.object({
  headline: z
    .string()
    .describe('A short, catchy, all-caps headline for the social media post.'),
  supportingText: z
    .string()
    .describe(
      'A brief, engaging supporting text, like lorem ipsum, to complement the headline.'
    ),
  ctaText: z
    .string()
    .describe(
      'A short, compelling call-to-action text for the button, in all caps.'
    ),
});

const GenerateBoldMinimalistImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated bold minimalist image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  headline: z.string(),
  supportingText: z.string(),
  ctaText: z.string(),
});
export type GenerateBoldMinimalistImageOutput = z.infer<
  typeof GenerateBoldMinimalistImageOutputSchema
>;

export async function generateBoldMinimalistImage(
  input: GenerateBoldMinimalistImageInput
): Promise<GenerateBoldMinimalistImageOutput> {
  return generateBoldMinimalistImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateTextContentPrompt',
  input: {schema: GenerateBoldMinimalistImageInputSchema},
  output: {schema: TextContentSchema},
  prompt: `You are a creative copywriter for a modern marketing agency.
Given the following social media post idea, generate the content for a bold, minimalist visual.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  A short, catchy, all-caps headline (e.g., "GROW YOUR BUSINESS").
2.  A brief, engaging supporting text. It should be one or two sentences long, like "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
3.  A short, compelling call-to-action (CTA) for a button, in all caps (e.g., "GET MORE LEADS").

Provide the output in the requested JSON format.`,
});

const generateBoldMinimalistImageFlow = ai.defineFlow(
  {
    name: 'generateBoldMinimalistImageFlow',
    inputSchema: GenerateBoldMinimalistImageInputSchema,
    outputSchema: GenerateBoldMinimalistImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt(input);

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    const imagePrompt = `Create a 1:1 square social media post.

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

📍 Layout & Content:
- Headline: "${textContent.headline}". Place it at the top-left or top-center. It should be large.
- Supporting Text: "${textContent.supportingText}". Place it directly below the headline.
- CTA Button: Create a call-to-action button in the bottom-right corner with the text "${textContent.ctaText}".

🧩 Optional Extras:
- Icons: Include subtle, white, line-style icons (megaphone, chart, email) near the central arrow with about 20% opacity.
- Underline: Add a thin, orange (#FF6A00) underline beneath the headline for an editorial touch.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('No image was generated.');
    }
    return {
      image: media.url!,
      headline: textContent.headline,
      supportingText: textContent.supportingText,
      ctaText: textContent.ctaText,
    };
  }
);
