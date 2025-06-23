'use server';
/**
 * @fileOverview Generates a retro minimal impact style image.
 *
 * - generateRetroMinimalImage - A function that generates the image.
 * - GenerateRetroMinimalImageInput - The input type for the generateRetroMinimalImage function.
 * - GenerateRetroMinimalImageOutput - The return type for the generateRetroMinimalImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateRetroMinimalImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  colorPalette: z.string().describe('The selected solid color for the background.'),
  companyName: z.string().describe('The company name or brand to display.'),
});
export type GenerateRetroMinimalImageInput = z.infer<
  typeof GenerateRetroMinimalImageInputSchema
>;

const TextContentSchema = z.object({
  headline: z.string().describe('A large, impactful, retro-style headline.'),
  secondaryText: z.string().describe('Smaller secondary informational text.'),
});

const GenerateRetroMinimalImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateRetroMinimalImageOutput = z.infer<
  typeof GenerateRetroMinimalImageOutputSchema
>;

export async function generateRetroMinimalImage(
  input: GenerateRetroMinimalImageInput
): Promise<GenerateRetroMinimalImageOutput> {
  return generateRetroMinimalImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateRetroMinimalTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateRetroMinimalImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are a minimalist designer with a love for retro aesthetics.
Given the following social media post idea, generate text content for a "Retro Minimal Impact" visual.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  A large, impactful, stark headline (e.g., "REINVENT THE PAST").
2.  Smaller, secondary informational text in uppercase (e.g., "A NOSTALGIC LOOK AT MODERN DESIGN").

Provide the output in the requested JSON format.`,
});

const generateRetroMinimalImageFlow = ai.defineFlow(
  {
    name: 'generateRetroMinimalImageFlow',
    inputSchema: GenerateRetroMinimalImageInputSchema,
    outputSchema: GenerateRetroMinimalImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    const imagePrompt = `Design a square (1:1) social media post in a retro-minimalist grid style with vintage photography and a structured layout. The design should combine modern minimalism with nostalgic charm.

🎨 Background:
- Use a solid, bold, saturated color as the background: "${input.colorPalette}".
- Overlay a subtle, evenly spaced geometric grid using thin white or off-white lines. The grid should provide a structured, editorial foundation.

📸 Vintage Visual Element:
- Feature a central vintage-style photograph with slight desaturation, grain, or film texture.
- The photo subject should be retro, like a person holding an old camera, a classic car, or a mid-century cityscape.
- The image should be integrated into the grid, either framed by it or slightly breaking it for contrast.

🔠 Typography:
- Use a clean, bold sans-serif font family like Helvetica Neue, Futura, or Montserrat.
- Main Headline: "${textContent.headline}". It should be large, impactful, and stark white or light beige. It can be oriented vertically or partially overlap the photo.
- Secondary Info Text: "${textContent.secondaryText}". Position it discreetly in a corner, aligned with the grid, in a smaller size and uppercase.

🏷️ Branding:
- Place the company name "${input.companyName}" subtly at the bottom center or a top corner.
- Style it in small caps, off-white, with spaced-out lettering.

🖌️ Optional Textural Layer:
- Apply a slight paper grain, dust overlay, or canvas texture over the entire composition for an analog feel.

✅ Overall Style Goals:
- Visually clean, modern, and editorial.
- Evokes 1970s-1990s design nostalgia without looking aged.
- Feels premium, artistic, and culturally informed.
- Balance negative space and bold imagery effectively.`;

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
    };
  }
);
