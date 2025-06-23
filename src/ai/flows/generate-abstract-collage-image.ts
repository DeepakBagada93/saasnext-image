'use server';
/**
 * @fileOverview Generates an abstract figurative collage style image.
 *
 * - generateAbstractCollageImage - A function that generates the image and its text content.
 * - GenerateAbstractCollageImageInput - The input type for the generateAbstractCollageImage function.
 * - GenerateAbstractCollageImageOutput - The return type for the generateAbstractCollageImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAbstractCollageImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  emotiveTheme: z.string().describe('The selected emotive theme for the collage.'),
});
export type GenerateAbstractCollageImageInput = z.infer<
  typeof GenerateAbstractCollageImageInputSchema
>;

const TextContentSchema = z.object({
  headline: z
    .string()
    .describe('A bold, expressive, and minimal headline for the collage.'),
  supportingText: z
    .string()
    .describe(
      'A minimal supporting line of text that aligns with the artistic tone.'
    ),
  ctaText: z
    .string()
    .describe('An optional, subtle call-to-action text.'),
});

const GenerateAbstractCollageImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated collage image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  headline: z.string(),
  supportingText: z.string(),
  ctaText: z.string(),
});
export type GenerateAbstractCollageImageOutput = z.infer<
  typeof GenerateAbstractCollageImageOutputSchema
>;

export async function generateAbstractCollageImage(
  input: GenerateAbstractCollageImageInput
): Promise<GenerateAbstractCollageImageOutput> {
  return generateAbstractCollageImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateCollageTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateAbstractCollageImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are an avant-garde artist creating copy for a zine cover.
Given the following social media post idea, generate raw, expressive text for an abstract collage.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  A bold, expressive, and minimal headline (e.g., "FRAGMENTS OF TRUTH").
2.  A minimal supporting line that aligns with the artistic tone (e.g., "What we piece together tells the real story").
3.  A subtle, optional call-to-action (e.g., "EXPLORE MORE").

Provide the output in the requested JSON format.`,
});

const generateAbstractCollageImageFlow = ai.defineFlow(
  {
    name: 'generateAbstractCollageImageFlow',
    inputSchema: GenerateAbstractCollageImageInputSchema,
    outputSchema: GenerateAbstractCollageImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    const imagePrompt = `Design a square (1:1) social media post or cover art in a raw, expressive artistic collage style using mixed media techniques.

🧩 Visual Composition:
- Construct the image from layered fragments: torn paper, ripped newspaper clippings, painted shapes, and cut-out facial forms.
- Fragments should overlap and intersect with varying opacity, creating depth and texture.
- Elements should feel handcrafted, pasted together in a way that balances chaos with intention.

🖼️ Abstracted Human Form:
- Feature a highly abstracted face or figure, composed of geometric or organic paper shapes forming cheeks, eyes, lips, and nose.
- Use asymmetry and expressive lines to convey emotion — a mix of elegance and rawness.
- Facial elements should not align perfectly, creating a surreal or dreamlike feel.

🎨 Color & Texture:
- Use a vibrant, expressive palette: electric blue, mustard yellow, cherry red, burnt orange, forest green, and stark black/white.
- Include visible brushstrokes, painted smears, charcoal scribbles, and ink blot textures.
- Mix newspaper print textures with flat color blocks and crumpled or wrinkled paper.

🧠 Emotive Theme:
- The collage should convey the theme of: "${input.emotiveTheme}".

🔠 Text Guidelines:
- Keep text bold, expressive, and minimal.
- Suggested placement: inside a torn paper label, over a large color block, or layered with light opacity.
- Font style: bold condensed serif, distressed stencil, or handwritten uppercase.

✏️ Content (Editable):
- Headline (top left or center, layered over fragments): "${textContent.headline}" — bold white or contrasting yellow on dark fragment.
- Supporting Line (smaller, near bottom or integrated into paper): "${textContent.supportingText}" — minimal, aligned with the tone.
- CTA (optional, subtle): "${textContent.ctaText}" — integrated in collage or on a faux-tape label.

💬 Overall Feel:
- Visually arresting, raw yet artful.
- Conveys tactility, emotion, chaos, and identity.
- Should feel like an art piece, worthy of a gallery wall or printed zine cover.`;


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
