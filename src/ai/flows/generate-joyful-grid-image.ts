'use server';
/**
 * @fileOverview Generates a joyful grid style image for tech audiences.
 *
 * - generateJoyfulGridImage - A function that generates the image.
 * - GenerateJoyfulGridImageInput - The input type for the generateJoyfulGridImage function.
 * - GenerateJoyfulGridImageOutput - The return type for the generateJoyfulGridImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateJoyfulGridImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  niche: z.string().describe('The target niche (e.g., Web Development).'),
  colorTheme: z.string().describe('The selected color theme.'),
  humanSubject: z.string().describe('The type of professional human subject to include.'),
  companyName: z.string().describe('The company name to display.'),
  website: z.string().describe('The website URL to display.'),
});
export type GenerateJoyfulGridImageInput = z.infer<
  typeof GenerateJoyfulGridImageInputSchema
>;

const TextContentSchema = z.object({
  headline: z.string().describe('A bold, energetic headline.'),
  tagline: z.string().describe('A smaller, supporting tagline.'),
  bodyText: z.string().describe('A very short, concise body text.'),
});

const GenerateJoyfulGridImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateJoyfulGridImageOutput = z.infer<
  typeof GenerateJoyfulGridImageOutputSchema
>;

export async function generateJoyfulGridImage(
  input: GenerateJoyfulGridImageInput
): Promise<GenerateJoyfulGridImageOutput> {
  return generateJoyfulGridImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateJoyfulGridTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateJoyfulGridImageInputSchema.shape.postIdea, niche: GenerateJoyfulGridImageInputSchema.shape.niche })},
  output: {schema: TextContentSchema},
  prompt: `You are a marketing expert for a B2B tech company.
Based on the following post idea and niche, generate concise and energetic marketing copy.

Post Idea: "{{{postIdea}}}"
Niche: "{{{niche}}}"

Generate the following:
1.  A bold, energetic headline (e.g., "CAPTURE YOUR BEST MOMENT").
2.  A smaller, supporting tagline (e.g., "Lorem ipsum dolor").
3.  A very short, concise body text (e.g., "Lorem ipsum dolor sit amet.").

Provide the output in the requested JSON format.`,
});

const generateJoyfulGridImageFlow = ai.defineFlow(
  {
    name: 'generateJoyfulGridImageFlow',
    inputSchema: GenerateJoyfulGridImageInputSchema,
    outputSchema: GenerateJoyfulGridImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea, niche: input.niche });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    let colorInstructions = '';
    let nicheSpecifics = '';

    switch (input.colorTheme) {
        case 'Blue & Orange Tech':
            colorInstructions = `Top Left Quadrant: Soft coral (#FAD2CF). Top Right Quadrant: Light teal (#B2EBF2). Bottom Half: Vibrant orange (#FFA500).`;
            break;
        case 'Green & Yellow Growth':
            colorInstructions = `Top Left Quadrant: Light mint green. Top Right Quadrant: Soft gray. Bottom Half: Marigold yellow (#FFCD3C).`;
            break;
        case 'Purple & Teal AI':
            colorInstructions = `Top Left Quadrant: Lavender. Top Right Quadrant: Cool light blue. Bottom Half: Deep teal.`;
            break;
    }

    switch (input.niche) {
        case 'Web Development':
            nicheSpecifics = `The framed image background shows a vertical split of professional blue and clean white.`;
            break;
        case 'Lead Generation':
            nicheSpecifics = `The framed image background shows a vertical split of energetic green and optimistic yellow.`;
            break;
        case 'AI Solutions':
            nicheSpecifics = `The framed image background shows a vertical split of futuristic purple and cool gray.`;
            break;
    }


    const imagePrompt = `Design a vibrant and cheerful square (1:1) social media graphic for a tech brand, using a modular quadrant system. The style is bright, modern, and full of energy.

🎨 Layout & Background:
- Create a split quadrant system.
- ${colorInstructions}
- Top Left Quadrant: Add a small cluster of white dots in the upper-left corner.
- Top Right Quadrant: Keep this area clean.
- Bottom Half: Keep this area a solid color.

👩‍🎤 Main Subject (Left Side – Framed Image Block):
- Place a thick white square frame on the left half of the graphic, covering parts of the top-left and bottom quadrants. It should have a subtle drop shadow.
- Inside the frame, feature a cheerful, professional subject: "${input.humanSubject}".
- The subject's outfit should complement the overall color palette.
- ${nicheSpecifics}

✍️ Text & Branding (Right Side Content Block):
- Top Right (Branding): Display the company name "${input.companyName}" in a bold, clean, white sans-serif font like Nunito or Poppins, placed directly over the top-right quadrant's background.
- Main Hook (Hero Text): The headline is "${textContent.headline}". Use a bold, all-caps sans-serif font (like Montserrat Extra Bold) and place it center-right over the top-right quadrant.
- Secondary Tagline: Below the headline, add the text "${textContent.tagline}" in a smaller, light-weight white sans-serif font.
- Supporting Body Copy (Lower Orange Area): Add the body text: "${textContent.bodyText}". Use a small white sans-serif font, aligned left, over the bottom half's background color.

🌐 Footer Bar (Bottom White Stripe):
- Add a white horizontal bar across the very bottom of the image.
- Left-aligned website text in black: "${input.website}".
- Right-aligned flat black social media icons: Facebook, Instagram, Twitter, WhatsApp.
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
