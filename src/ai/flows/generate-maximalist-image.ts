'use server';
/**
 * @fileOverview Generates a maximalist illustration image based on a post idea.
 *
 * - generateMaximalistImage - A function that generates the image and its text content.
 * - GenerateMaximalistImageInput - The input type for the generateMaximalistImage function.
 * - GenerateMaximalistImageOutput - The return type for the generateMaximalistImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMaximalistImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  sceneDescription: z
    .string()
    .describe('A description of the scene to illustrate.'),
});
export type GenerateMaximalistImageInput = z.infer<
  typeof GenerateMaximalistImageInputSchema
>;

const TextContentSchema = z.object({
  headline: z
    .string()
    .describe('An expressive, inspiring headline for the social media post.'),
  supportingText: z

    .string()
    .describe(
      'A short, charming supporting text that tells a story.'
    ),
  ctaText: z
    .string()
    .describe('A friendly and inviting call-to-action text.'),
});

const GenerateMaximalistImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated maximalist illustration image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  headline: z.string(),
  supportingText: z.string(),
  ctaText: z.string(),
});
export type GenerateMaximalistImageOutput = z.infer<
  typeof GenerateMaximalistImageOutputSchema
>;

export async function generateMaximalistImage(
  input: GenerateMaximalistImageInput
): Promise<GenerateMaximalistImageOutput> {
  return generateMaximalistImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateMaximalistTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateMaximalistImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are a whimsical storyteller and artist.
Given the following social media post idea, generate evocative text for a rich, maximalist illustration.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  An expressive, inspiring headline (e.g., "IDEAS DESERVE TO BLOOM").
2.  A short, charming supporting text that tells a story (e.g., "We craft stories, not just visuals.").
3.  A friendly and inviting call-to-action (CTA) (e.g., "LET'S CREATE TOGETHER").

Provide the output in the requested JSON format.`,
});

const generateMaximalistImageFlow = ai.defineFlow(
  {
    name: 'generateMaximalistImageFlow',
    inputSchema: GenerateMaximalistImageInputSchema,
    outputSchema: GenerateMaximalistImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    const imagePrompt = `Design a square (1:1) social media post in a rich, detailed Maximalist Illustration style.

🖼️ Visual Style & Composition:
- Center the composition around this scene: ${input.sceneDescription}.
- The illustration must be highly detailed and scene-driven, filling the canvas. Maintain visual balance with clear focal points and a natural flow.
- Incorporate layered textures like fabric, fur, wood, or paper to add depth.
- Showcase visible linework, shading, cross-hatching, or brush textures for an organic, hand-drawn feel.

🎨 Color Palette:
- Use a vibrant, varied, and harmonious color palette. Jewel tones, rich pastels, and natural tones should coexist beautifully.
- Avoid flat monotones or overly desaturated colors. The overall feel should be rich and full of life.

📜 Typography & Text Placement:
- Integrate the typography naturally into the illustration. For example, the text could appear on a banner, a book cover, a building sign, or written in a sunbeam.
- Use a hand-lettered style font or an expressive, charming serif/sans-serif font.
- Ensure all text is legible, placing it over calmer areas of the illustration or within framed elements.

🧩 Content to Include:
- Headline (integrated at the top or middle): "${textContent.headline}"
- Supporting Text (smaller, placed somewhere it fits naturally): "${textContent.supportingText}"
- Call to Action (integrated into the scene, like on a signpost or a book): "${textContent.ctaText}"

✍️ Tone & Emotion:
- The final image should feel rich, inspired, expressive, and human.
- It must spark imagination, wonder, and creativity, inviting the viewer to explore every corner of the composition.`;

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
