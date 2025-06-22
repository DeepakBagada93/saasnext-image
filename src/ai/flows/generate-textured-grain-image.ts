'use server';
/**
 * @fileOverview Generates a textured grain image based on a post idea.
 *
 * - generateTexturedGrainImage - A function that generates the image and its text content.
 * - GenerateTexturedGrainImageInput - The input type for the generateTexturedGrainImage function.
 * - GenerateTexturedGrainImageOutput - The return type for the generateTexturedGrainImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateTexturedGrainImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  colorPalette: z.string().describe('The selected color palette for the image.'),
  imageElements: z
    .string()
    .optional()
    .describe(
      'Optional elements to include in the image, like "rectangle frame" or "underline bar".'
    ),
});
export type GenerateTexturedGrainImageInput = z.infer<
  typeof GenerateTexturedGrainImageInputSchema
>;

const TextContentSchema = z.object({
  headline: z
    .string()
    .describe('A short, catchy, all-caps headline for the social media post.'),
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

const GenerateTexturedGrainImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated textured image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  headline: z.string(),
  supportingText: z.string(),
  ctaText: z.string(),
});
export type GenerateTexturedGrainImageOutput = z.infer<
  typeof GenerateTexturedGrainImageOutputSchema
>;

export async function generateTexturedGrainImage(
  input: GenerateTexturedGrainImageInput
): Promise<GenerateTexturedGrainImageOutput> {
  return generateTexturedGrainImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateGrainTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateTexturedGrainImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are a creative copywriter for a design studio that specializes in authentic, tactile branding.
Given the following social media post idea, generate content for a "Textured Grain" style visual.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  A bold, uppercase headline (e.g., "REAL STRATEGY. REAL GROWTH.").
2.  A supporting text that is authentic and grounded (e.g., "We craft brands that feel as real as your goals.").
3.  A call-to-action for a button, in all caps (e.g., "LET'S BUILD TOGETHER").

Provide the output in the requested JSON format.`,
});

const generateTexturedGrainImageFlow = ai.defineFlow(
  {
    name: 'generateTexturedGrainImageFlow',
    inputSchema: GenerateTexturedGrainImageInputSchema,
    outputSchema: GenerateTexturedGrainImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    const imagePrompt = `Create a square (1:1) social media post image inspired by the "Textured Grains" design style.

🪵 Visual Style & Texture:
- Apply a uniform, prominent grain or noise overlay across the entire design.
- The texture should mimic rough paper, silkscreen print, canvas, or aged magazine print.
- The texture should interact subtly with text and shapes, creating a 'printed' or 'stamped' look.

🎨 Color Palette (2–4 Colors Only):
- Use the "${input.colorPalette}" theme.
- For "muted-tones": Use desaturated tones like dusty rust, faded navy, parchment, and deep charcoal.
- For "bold-vintage": Use bold vintage colors softened by texture, like tomato red, mustard yellow, and cobalt blue.
- The background color must be an off-white, light beige, or dusty paper tone from the chosen palette.

🔠 Typography (Headline & Copy):
- All sans-serif, bold, clean.
- Typography should absorb some of the texture, giving it a tactile, slightly distressed edge.
- Keep alignment simple and geometric — either center-aligned or top-left-aligned.

🧩 Content:
- Headline (Top-Center or Top-Left): "${textContent.headline}" — bold, uppercase.
- Supporting Text (Just Below Headline): "${textContent.supportingText}" — medium weight, smaller size.
- CTA (Bottom-Center or Bottom-Right): A rectangle or pill-style button with a textured background and bold text: "${textContent.ctaText}" — all caps.

📐 Layout & Design Notes:
- Minimal, clean composition with ample negative space.
- Allow the texture to breathe, giving authenticity.
- ${input.imageElements ? `Include simple block shapes like: ${input.imageElements}.` : 'Do not include any complex graphics. Simple block shapes like a rectangle frame or an underline bar are acceptable if they fit the minimal aesthetic.'}
- Consider slight misalignment or edge bleed to enhance the analog feel.

🧠 Emotional Tone:
- Feels authentic, grounded, imperfect, and tactile.
- Conveys trust, warmth, and realism — like something printed by hand, not just clicked into place.`;


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
