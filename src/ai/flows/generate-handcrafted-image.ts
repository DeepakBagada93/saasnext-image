'use server';
/**
 * @fileOverview Generates a handcrafted, organic analog style image.
 *
 * - generateHandcraftedImage - A function that generates the image and its text content.
 * - GenerateHandcraftedImageInput - The input type for the generateHandcraftedImage function.
 * - GenerateHandcraftedImageOutput - The return type for the generateHandcraftedImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHandcraftedImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  illustrativeMotifs: z
    .string()
    .describe('The selected illustrative motifs for the image.'),
});
export type GenerateHandcraftedImageInput = z.infer<
  typeof GenerateHandcraftedImageInputSchema
>;

const TextContentSchema = z.object({
  headline: z
    .string()
    .describe('A catchy, all-caps headline in a handcrafted style.'),
  supportingText: z
    .string()
    .describe(
      'A short, personal, and soulful supporting text.'
    ),
  ctaText: z
    .string()
    .describe('A compelling call-to-action text with a handcrafted feel.'),
});

const GenerateHandcraftedImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated handcrafted image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  headline: z.string(),
  supportingText: z.string(),
  ctaText: z.string(),
});
export type GenerateHandcraftedImageOutput = z.infer<
  typeof GenerateHandcraftedImageOutputSchema
>;

export async function generateHandcraftedImage(
  input: GenerateHandcraftedImageInput
): Promise<GenerateHandcraftedImageOutput> {
  return generateHandcraftedImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateHandcraftedTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateHandcraftedImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are a copywriter for an artisan brand that values handmade quality.
Given the following social media post idea, generate content for a handcrafted, organic visual.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  An all-caps headline that feels authentic and intentional (e.g., "CRAFTED WITH INTENTION").
2.  A short, personal, and soulful supporting text (e.g., "Every brand has a soul — we bring it to life with story, shape, and sketch.").
3.  A call-to-action that sounds like a personal invitation (e.g., "LET’S START SKETCHING").

Provide the output in the requested JSON format.`,
});

const generateHandcraftedImageFlow = ai.defineFlow(
  {
    name: 'generateHandcraftedImageFlow',
    inputSchema: GenerateHandcraftedImageInputSchema,
    outputSchema: GenerateHandcraftedImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    const imagePrompt = `Create a 1:1 square social media post in a handcrafted / organic analog graphic design style.

✍️ Visual Style & Elements:
- Use hand-drawn, sketchy illustrations as the primary visual style.
- Lines should be slightly wobbly and imperfect, resembling an ink pen, pencil, or brush marker.
- All shapes and icons must feel doodled or personally illustrated, not vector-smooth.

🧵 Textures & Layers:
- Apply a natural texture like canvas, cotton paper, or recycled paper with visible fibers.
- The background could also feel like a lined notebook, kraft paper, or an old sketchbook.
- Include light distressing or subtle ink blotches to enhance the analog imperfection.
- Optionally, include layered collage elements like torn paper shapes or masking tape edges.

🎨 Color Palette:
- Use a warm, earthy color palette. Think clay orange, olive green, muted mustard, dusty rose, and warm gray.
- Avoid neon or harsh, synthetic contrasts. The colors should feel natural and handmade.

🔠 Typography:
- Combine handwritten-style fonts with rough-edged, letterpress-style typefaces.
- The text should feel expressive and personal, not digital.
- You can include small annotations, arrows, or circled highlights as if written in a sketchbook.

📜 Content Example:
- Headline (Top or Center): "${textContent.headline}" — use an all-caps, brush-style or distressed serif font.
- Supporting Text (just under or to the side): "${textContent.supportingText}"
- Call to Action (bottom corner or on a hand-drawn tag/banner): "${textContent.ctaText}"

🎨 Illustrative Motifs:
- Feature these illustrative motifs: ${input.illustrativeMotifs}.

🧠 Overall Feel:
- The image must feel warm, human-centered, and grounded in tactile artistry.
- It should look like a page from an artist's journal, a personal artboard, or a handmade collage.
- Balance the quiet imperfection with soulful intention.`;


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
