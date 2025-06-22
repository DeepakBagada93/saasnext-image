'use server';
/**
 * @fileOverview Generates a dynamic corporate gradient style image.
 *
 * - generateCorporateGradientImage - A function that generates the image and its text content.
 * - GenerateCorporateGradientImageInput - The input type for the generateCorporateGradientImage function.
 * - GenerateCorporateGradientImageOutput - The return type for the generateCorporateGradientImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateCorporateGradientImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  colorPalette: z.string().describe('The selected color palette for the gradient.'),
  humanSubject: z.string().describe('The type of professional human subject to include.'),
  includeQRCode: z.boolean().optional().describe('Whether to include a QR code area.'),
});
export type GenerateCorporateGradientImageInput = z.infer<
  typeof GenerateCorporateGradientImageInputSchema
>;

const TextContentSchema = z.object({
  headline: z.string().describe('A bold, modern, all-caps headline for the corporate post.'),
  subheadline: z.string().describe('A compelling and professional subheadline to support the main message.'),
  features: z.array(z.string()).min(3).max(5).describe('A list of 3-5 concise, impactful features or benefits derived from the post idea.'),
  ctaText: z.string().describe('A clear and direct call-to-action for the button, in all caps.'),
});

const GenerateCorporateGradientImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated corporate image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateCorporateGradientImageOutput = z.infer<
  typeof GenerateCorporateGradientImageOutputSchema
>;

export async function generateCorporateGradientImage(
  input: GenerateCorporateGradientImageInput
): Promise<GenerateCorporateGradientImageOutput> {
  return generateCorporateGradientImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateCorporateTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateCorporateGradientImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are an expert marketing copywriter for a B2B tech company.
Analyze the following social media post idea and generate concise, professional marketing copy.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  A bold, modern, all-caps headline (e.g., "GRAPHIC DESIGN REDEFINED").
2.  A compelling subheadline that elaborates on the headline (e.g., "Elevate your brand with next-gen visuals and strategy.").
3.  A list of exactly 3-5 impactful, concise feature points. Each point should be a short phrase highlighting a key benefit or service.
4.  A clear, all-caps call-to-action for a button (e.g., "GET A QUOTE").

Provide the output in the requested JSON format.`,
});

const generateCorporateGradientImageFlow = ai.defineFlow(
  {
    name: 'generateCorporateGradientImageFlow',
    inputSchema: GenerateCorporateGradientImageInputSchema,
    outputSchema: GenerateCorporateGradientImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    const featuresList = textContent.features.map(f => `- ${f}`).join('\n');

    let imagePrompt = `Design a square (1:1) social media post in a clean, highly polished corporate style with a modern gradient aesthetic.

🎨 Gradient Background:
- Use a smooth, multi-color gradient background blending these corporate tones: "${input.colorPalette}".
- For "Deep blue to vibrant orange/yellow": Blend from #001F3F to #FF8C00.
- For "Royal purple to sky blue": Blend from #4B0082 to #87CEEB.
- For "Cool teal to steel gray": Blend from #008080 to #708090.
- The gradient should feel fluid, setting a tone of innovation and modernity.

👤 Professional Human Subject:
- Include a high-resolution, well-lit professional: "${input.humanSubject}".
- The subject should be cleanly cut out and subtly integrated into the gradient on one side of the image.

🔠 Typography:
- Use a bold, modern, sans-serif font like Inter or Poppins.
- Headline (large, centered or top-left): "${textContent.headline}"
- Subheadline (smaller, under headline): "${textContent.subheadline}"

📑 Structured Feature List:
- Display the following list of features clearly with minimal icons (like a simple checkmark ✔ or dot •) before each item:
${featuresList}

🔘 Call to Action (CTA) Button:
- Create a clear, high-contrast pill-shaped button in the bottom-right or center-bottom with the text: "${textContent.ctaText}".

📱 Contact & Social Media Section:
- Include a placeholder phone number: "+91-123-456-7890".
- Display 3-4 minimalist social media icons in a horizontal row: LinkedIn, Instagram, X (Twitter). Style them as clean, white outlines.

🌀 Digital Accent Graphics:
- Integrate subtle abstract elements like clean lines, floating dots, or soft curves to guide the eye and add a modern, digital feel.

✅ Overall Feel:
- Professional, clean, forward-thinking, and trustworthy.
- Perfect for service promotions, SaaS marketing, or digital consultancy.
- The entire composition must look sophisticated and cutting-edge.`;
    
    if (input.includeQRCode) {
        imagePrompt += `

🔳 QR Code Area:
- Allocate a clean corner (bottom-left) for a placeholder QR code.
- Style it with a soft border and add the label "SCAN TO CONNECT" below it.`;
    }


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
