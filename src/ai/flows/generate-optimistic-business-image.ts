'use server';
/**
 * @fileOverview Generates an optimistic business style image.
 *
 * - generateOptimisticBusinessImage - A function that generates the image.
 * - GenerateOptimisticBusinessImageInput - The input type for the generateOptimisticBusinessImage function.
 * - GenerateOptimisticBusinessImageOutput - The return type for the generateOptimisticBusinessImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateOptimisticBusinessImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  colorPalette: z.string().describe('The selected color palette for the gradient background.'),
  humanSubject: z.string().describe('The type of professional human subject to include.'),
});
export type GenerateOptimisticBusinessImageInput = z.infer<
  typeof GenerateOptimisticBusinessImageInputSchema
>;

const TextContentSchema = z.object({
  tagline: z.string().describe('A short, encouraging tagline.'),
  headline: z.string().describe('A bold, optimistic main headline.'),
  ctaText: z.string().describe('A clear call-to-action for a button.'),
});

const GenerateOptimisticBusinessImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateOptimisticBusinessImageOutput = z.infer<
  typeof GenerateOptimisticBusinessImageOutputSchema
>;

export async function generateOptimisticBusinessImage(
  input: GenerateOptimisticBusinessImageInput
): Promise<GenerateOptimisticBusinessImageOutput> {
  return generateOptimisticBusinessImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateOptimisticBusinessTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateOptimisticBusinessImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are an uplifting marketing copywriter for a motivational brand.
Given the following social media post idea, generate concise, optimistic marketing copy.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  A short, encouraging tagline (e.g., "YOUR PARTNER IN SUCCESS").
2.  A bold, optimistic main headline (e.g., "GROW YOUR BUSINESS!").
3.  A clear call-to-action for a button (e.g., "CONTACT US").

Provide the output in the requested JSON format.`,
});

const generateOptimisticBusinessImageFlow = ai.defineFlow(
  {
    name: 'generateOptimisticBusinessImageFlow',
    inputSchema: GenerateOptimisticBusinessImageInputSchema,
    outputSchema: GenerateOptimisticBusinessImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    const imagePrompt = `Design a 1:1 square social media post image that communicates optimism, business growth, and enthusiasm. The style should be clean, bright, optimistic, and action-oriented.

🎉 Background & Mood:
- Use a vibrant, radiant gradient background blending these colors: "${input.colorPalette}".
- For "Bright blue sky to light turquoise": Blend from a sky blue to turquoise.
- For "Sunny yellow to soft orange": Blend from a bright yellow to a soft orange.
- For "Fresh lime green to warm cream": Blend from lime green to a warm cream color.
- For "Uplifting violet to pink mist": Blend from a light violet to a misty pink.
- Include a subtle radiating light or sunburst effect from behind the subject to reinforce positivity.
- Optionally add subtle, light elements like sparkles or soft-focus light rays.

👤 Human Subject (Central & Relatable):
- Feature a high-quality, expressive, and friendly person: "${input.humanSubject}".
- The subject should be well-lit and smoothly integrated into the background.

🔠 Typography & Messaging:
- Use a bold, modern sans-serif font family like Inter or Poppins.
- Tagline (Top or Above Main Headline, Medium Weight): "${textContent.tagline}"
- Main Headline (Center, Extra Bold): "${textContent.headline}"
- Highlight keywords in the headline with bright white or a contrasting color from the palette.

🌿 Organic Visual Accents:
- Add soft, abstract shapes like light cloud-like outlines or swirls in the background. They should be subtle and not distracting.

🪑 Grounded Setting:
- Position the subject on a clean, light-colored platform or floor to feel grounded. Add soft shadows for realism.

🏷️ Company & Contact Elements:
- Top-left or top-right: Include a placeholder for "Your Company Name" in bold, clean text.
- Bottom Left: Display this contact info: "Phone: +91-987-654-3210" and "Website: www.yourcompany.com".
- Bottom Right CTA Button: Create a rounded pill-shaped button with the text "${textContent.ctaText}". The button should be a bright, contrasting color with white text.

✨ Overall Visual Style:
- The final image must feel clean, bright, and polished, with ample negative space. It should be optimistic and action-oriented.
`;

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
