'use server';
/**
 * @fileOverview Generates a pixel art retro-futurism image based on a post idea.
 *
 * - generatePixelArtImage - A function that generates the image and its text content.
 * - GeneratePixelArtImageInput - The input type for the generatePixelArtImage function.
 * - GeneratePixelArtImageOutput - The return type for the generatePixelArtImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePixelArtImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  colorPalette: z.string().describe('The selected color palette for the image.'),
  imageElements: z
    .string()
    .optional()
    .describe(
      'Optional elements to include in the image, like "joystick" or "floppy disk".'
    ),
});
export type GeneratePixelArtImageInput = z.infer<
  typeof GeneratePixelArtImageInputSchema
>;

const TextContentSchema = z.object({
  headline: z
    .string()
    .describe('A short, catchy, all-caps headline for the social media post, in a retro-futuristic style.'),
  supportingText: z
    .string()
    .describe(
      'A brief, engaging supporting text to complement the headline.'
    ),
  ctaText: z
    .string()
    .describe(
      'A short, compelling call-to-action text for the button, in all caps.'
    ),
});

const GeneratePixelArtImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated pixel art image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  headline: z.string(),
  supportingText: z.string(),
  ctaText: z.string(),
});
export type GeneratePixelArtImageOutput = z.infer<
  typeof GeneratePixelArtImageOutputSchema
>;

export async function generatePixelArtImage(
  input: GeneratePixelArtImageInput
): Promise<GeneratePixelArtImageOutput> {
  return generatePixelArtImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generatePixelTextContentPrompt',
  input: {schema: z.object({ postIdea: GeneratePixelArtImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are a creative copywriter for a retro-themed arcade.
Given the following social media post idea, generate the content for a pixelated, retro-futuristic visual.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  A short, catchy, all-caps headline (e.g., "LEVEL UP YOUR BRAND").
2.  A brief, engaging supporting text (e.g., "Strategy. Style. Scale.").
3.  A short, compelling call-to-action (CTA) for a button, in all caps (e.g., "START NOW").

Provide the output in the requested JSON format.`,
});

const generatePixelArtImageFlow = ai.defineFlow(
  {
    name: 'generatePixelArtImageFlow',
    inputSchema: GeneratePixelArtImageInputSchema,
    outputSchema: GeneratePixelArtImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    const imagePrompt = `Create a square (1:1) social media post image in a bold Pixel Art Retro-Futurism / Digital Retro style.

🎮 Core Aesthetic:
- Pixelated/8-bit/16-bit visual style — all text and graphics should reflect a retro digital aesthetic.
- Design should feel like a blend of arcade-style graphics and futuristic UI from the 80s.

🎨 Color Palette:
- Use the "{{colorPalette}}" theme.
- For "Neon Pink & Electric Blue": Use a deep black (#000000) or midnight purple (#1A001A) background. Use neon pink (#FF00FF) and electric blue (#00FFFF) for text, borders, and visual elements.
- For "Bright Yellow & VHS Green": Use a dark retro background. Use bright yellow (#FFFF00) and VHS green (#00FF00) for accents.
- For "Electric Blue & Bright Yellow": Use a dark background. Use electric blue (#00FFFF) and bright yellow (#FFFF00) for high-contrast elements.
- Use limited color depth to stay true to pixel art restrictions.

🖼️ Design & Layout:
- Keep it clean, geometric, and symmetrical or subtly randomized.
- Use pixelated borders and blocky geometric shapes (triangles, squares, grids) as decorative or framing elements.
- Incorporate 8-bit elements like HUD lines, screen scanlines, or glitch edges.

🔠 Typography (Pixel Font):
- All caps, bold blocky pixelated font, sans-serif.
- Text color should strongly contrast background.

📢 Content:
- Headline (Top-Center or Top-Left): "${textContent.headline}" — large, bold, all caps, pixelated.
- Supporting Text (Under Headline): "${textContent.supportingText}" — smaller, spaced out, pixel font.
- CTA Button (Bottom-Right or Center): Rectangular pixel-style button in a bright color with white pixelated text: "${textContent.ctaText}"

🧩 Visual Enhancements:
- Background should feature subtle retro textures like VHS static, CRT grain, or low-opacity digital paper texture.
- Add small pixel icons like ${input.imageElements || 'a floppy disk and a joystick'} with ~30% opacity for nostalgic depth.
- Use neon glowing edges or glitch effects lightly to suggest digital distortion.

🕹️ Overall Vibe:
- Think 1980s arcade game meets futuristic UI.
- Energetic, bold, tech-savvy, and distinctly pixelated.`;


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
