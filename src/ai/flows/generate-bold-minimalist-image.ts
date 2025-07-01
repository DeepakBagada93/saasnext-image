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
  colorPalette: z.string().describe('The selected color palette for the image.'),
  fontStyle: z.string().describe('The selected font style for the text.'),
  imageElements: z
    .string()
    .optional()
    .describe(
      'Optional elements to include in the image, like "graph" or "upward arrow".'
    ),
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
      'A brief, one-sentence supporting text to complement the headline.'
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
  input: {schema: z.object({ postIdea: GenerateBoldMinimalistImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are a creative copywriter for a modern marketing agency.
Given the following social media post idea, generate the content for a bold, minimalist visual.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  A short, catchy, all-caps headline (e.g., "GROW YOUR BUSINESS").
2.  A brief, one-sentence supporting text (e.g., "Lorem ipsum dolor sit amet, consectetur adipiscing elit.").
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
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

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
- Use the "${input.colorPalette}" theme.
- For "navy-orange": Use a solid navy blue (#001F3F) background and vibrant orange (#FF6A00) for accents like arrows or underlines. Text is white (#FFFFFF) or light gray (#D3D3D3).
- For "black-gold": Use a deep black (#000000) background and a rich gold (#FFD700) for accents. Text is white (#FFFFFF).
- For "teal-white": Use a modern teal (#008080) background with white (#FFFFFF) accents and dark gray (#36454F) text.
- The background should have a subtle abstract noise or a soft diagonal texture at about 5% opacity.

✒️ Font Style:
- Use a "${input.fontStyle}" font.
- For "modern-sans-serif": Use a clean, geometric sans-serif font like Poppins or Lato.
- For "classic-serif": Use an elegant, high-contrast serif font like Playfair Display or Lora.
- For "bold-display": Use a thick, impactful display font perfect for headlines.

📍 Layout & Content:
- Headline: "${textContent.headline}". Place it at the top-left or top-center. It should be large and in all caps.
- Supporting Text: "${textContent.supportingText}". Place it directly below the headline.
- CTA Button: Create a pill-shaped call-to-action button in the bottom-right corner with the text "${textContent.ctaText}". The button color should match the accent color of the chosen palette, with white text.

🧩 Core Visual Elements:
- Include the following elements as the central focus: ${input.imageElements || 'a large, upward-pointing arrow in the accent color'}.
- Make these elements prominent but minimalist.

🧩 Optional Extras (if they fit the design):
- Subtle white line-style icons (e.g., megaphone, chart, email) near the central elements with about 20% opacity.
- A thin underline in the accent color beneath the headline for an editorial touch.`;


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
