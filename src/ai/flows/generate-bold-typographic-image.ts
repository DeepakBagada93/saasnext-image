'use server';
/**
 * @fileOverview Generates a bold typographic impact style image.
 *
 * - generateBoldTypographicImage - A function that generates the image.
 * - GenerateBoldTypographicImageInput - The input type for the generateBoldTypographicImage function.
 * - GenerateBoldTypographicImageOutput - The return type for the generateBoldTypographicImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateBoldTypographicImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
});
export type GenerateBoldTypographicImageInput = z.infer<
  typeof GenerateBoldTypographicImageInputSchema
>;

const TextContentSchema = z.object({
  line1: z.string().describe('The first line of text, small and regular weight.'),
  line2: z.string().describe('The second line of text, very large and extra bold.'),
  line3: z.string().describe('The third line of text, medium size and light weight.'),
  line4: z.string().describe('The fourth line of text, huge and extra bold, posing a question.'),
});

const GenerateBoldTypographicImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated typographic image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateBoldTypographicImageOutput = z.infer<
  typeof GenerateBoldTypographicImageOutputSchema
>;

export async function generateBoldTypographicImage(
  input: GenerateBoldTypographicImageInput
): Promise<GenerateBoldTypographicImageOutput> {
  return generateBoldTypographicImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateBoldTypographicTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateBoldTypographicImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are a provocative marketing copywriter specializing in high-impact, direct-questioning ads.
Given the following social media post idea, generate four lines of text that build drama and end with a challenging question.

Post Idea: "{{{postIdea}}}"

Generate the following four lines of text, following the dramatic structure precisely:
1.  A short setup phrase, in a normal tone.
2.  A powerful, high-impact statement, very bold.
3.  A clarifying or connecting phrase, in a lighter tone.
4.  A final, provocative question that challenges the reader directly.

Example for "social media engagement":
Line 1: "ARE YOUR"
Line 2: "SOCIAL ADS"
Line 3: "DRIVING REAL ENGAGEMENT"
Line 4: "OR JUST SCROLL BAIT?"

Provide the output in the requested JSON format.`,
});

const generateBoldTypographicImageFlow = ai.defineFlow(
  {
    name: 'generateBoldTypographicImageFlow',
    inputSchema: GenerateBoldTypographicImageInputSchema,
    outputSchema: GenerateBoldTypographicImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    const imagePrompt = `Create a high-impact, text-only square social media post (1:1 aspect ratio) in the “Bold Typographic Impact” and “Direct Questioning” design style.

🖤 Core Style & Layout:
- Background: Solid deep black (#000000).
- Typography: Use a clean, geometric sans-serif font family like Helvetica, Inter, or Montserrat.
- Use dramatic font size variation and weight contrast to build rhythm and tension.
- Employ strategic line breaks and emphasis shifts to guide the eye downward.

⚪ Color Palette:
- Primary Text Color: Pure white (#FFFFFF).
- Highlight Accents (Optional): Use a slightly off-white gray (#AAAAAA) for the less important lines.

✍️ Text Layout (Use this exact text and formatting):
- Line 1 (Small, Regular weight): "${textContent.line1}"
- Line 2 (Very Large, Extra Bold weight): "${textContent.line2}"
- Line 3 (Medium, Light weight): "${textContent.line3}"
- Line 4 (Huge, Extra Bold weight): "${textContent.line4}"

🔠 Typography Strategy:
- Maintain a consistent font family throughout, but shift through weights: Light -> Regular -> Bold -> Extra Bold.
- Use increased letter spacing on the final line for tension.
- Center-align all text.

🌫️ Subtle Enhancements:
- Add a subtle blur/glow or shadow effect to the final line of text ("${textContent.line4}") to make it stand out.
- Add a very faint, almost invisible background text layer repeating a relevant phrase diagonally in a dark gray color like #111111.

✅ Final Composition Goals:
- The text is the visual. There must be no icons, illustrations, or photos.
- The design must feel authoritative, urgent, minimal, and modern.
- It must be perfect for ads, marketing call-outs, or provocative business takes.

📲 Output Feel:
- Eye-catching in-feed post that makes the viewer pause and read.
- Clean and provocative.`;


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
