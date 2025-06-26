'use server';
/**
 * @fileOverview Generates a bold activist/protest style image.
 *
 * - generatePowerGraphicImage - A function that generates the image.
 * - GeneratePowerGraphicImageInput - The input type for the generatePowerGraphicImage function.
 * - GeneratePowerGraphicImageOutput - The return type for the generatePowerGraphicImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePowerGraphicImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  colorTheme: z.string().describe('The selected color theme for the graphic.'),
  humanSubject: z.string().describe('The type of human subject to include.'),
  organizationName: z.string().describe('The name of the organization or movement.'),
  includeQRCode: z.boolean().optional().describe('Whether to include a QR code area.'),
});
export type GeneratePowerGraphicImageInput = z.infer<
  typeof GeneratePowerGraphicImageInputSchema
>;

const TextContentSchema = z.object({
  headline: z.string().describe('A bold, uppercase headline for the protest graphic.'),
  secondaryMessage: z.string().describe('A smaller, secondary message to support the headline.'),
  subtext: z.string().describe('A brief, generic subtext for additional context, like a lorem ipsum placeholder.'),
});

const GeneratePowerGraphicImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GeneratePowerGraphicImageOutput = z.infer<
  typeof GeneratePowerGraphicImageOutputSchema
>;

export async function generatePowerGraphicImage(
  input: GeneratePowerGraphicImageInput
): Promise<GeneratePowerGraphicImageOutput> {
  return generatePowerGraphicImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generatePowerGraphicTextContentPrompt',
  input: {schema: z.object({ postIdea: GeneratePowerGraphicImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are a copywriter for an activist movement, creating text for a powerful protest graphic.
Given the following post idea, generate the content.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  A bold, uppercase headline (e.g., "TIME TO RESIST").
2.  A smaller secondary message (e.g., "Stay tuned for calls to action.").
3.  A generic subtext placeholder about one sentence long (e.g., "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.").

Provide the output in the requested JSON format.`,
});


const generatePowerGraphicImageFlow = ai.defineFlow(
  {
    name: 'generatePowerGraphicImageFlow',
    inputSchema: GeneratePowerGraphicImageInputSchema,
    outputSchema: GeneratePowerGraphicImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }
    
    let colorInstructions = '';
    switch (input.colorTheme) {
        case 'Red Alert':
            colorInstructions = 'Use a deep red (#8B0000) for the primary background, a muted cream (#F5F0E1) for the accent panel, and stark white for text and outlines.';
            break;
        case 'Blue Wave':
            colorInstructions = 'Use a midnight blue (#002B36) for the primary background, a soft gray (#D3D3D3) for the accent panel, and light beige for text and outlines.';
            break;
        case 'Green Earth':
            colorInstructions = 'Use a forest green (#014421) for the primary background, a dusty peach color for the accent panel, and off-white for text and outlines.';
            break;
    }

    let imagePrompt = `Design a square (1:1) social media post in a bold activism/protest style, featuring a dual-pane split layout.

🎨 Color Scheme:
- ${colorInstructions}

🧱 Layout Structure:
- Left Side: Create a sharp, angular background shape (like a trapezoid or slanted rectangle) using the accent background color. This shape should fill most of the left half.
- Right Side: The primary background color fills this side.

🔤 Typography & Text (on the Left Side):
- Use an extra bold, uppercase sans-serif font (like Anton or Bebas Neue).
- Headline: "${textContent.headline}". Position it prominently on the accent background panel.
- Secondary Message: "${textContent.secondaryMessage}". Place this in a smaller font size directly below the headline.
- Subtext: "${textContent.subtext}". Place this below the secondary message, even smaller.

👤 High-Emotion Human Subject (on the Right Side):
- Feature a high-emotion subject: "${input.humanSubject}".
- The subject must be cleanly cut out and placed over the primary background color.
- Frame the subject with a bold, stylized outline using the text/outline color.
- Behind the main subject, add a subtle, ghosted silhouette of another figure with about 10-15% opacity.
- Apply a distressed texture overlay (like grain or halftone dots) over the right-side background.

📱 Social Media & Branding:
- Top-Right Corner: Include minimalist, flat outline icons for Instagram, X (Twitter), and Facebook. Use a muted version of the text color.
- Bottom-Left Corner: Display the organization name "${input.organizationName}" in a clean, neutral sans-serif font. Style it with a thin underline.

✅ Design Mood:
- The overall mood should be urgent, rebellious, and defiant, meant to inspire action.
- The design must be clean but emotionally raw and expressive.`;

    if (input.includeQRCode) {
        imagePrompt += `

🔳 QR Code Area:
- In the bottom-right corner, add a placeholder for a QR code with a simple border in the outline color. Label it "SCAN FOR ACTION" below.`;
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
