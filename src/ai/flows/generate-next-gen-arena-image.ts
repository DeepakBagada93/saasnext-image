'use server';
/**
 * @fileOverview Generates a high-energy e-sports style image.
 *
 * - generateNextGenArenaImage - A function that generates the image.
 * - GenerateNextGenArenaImageInput - The input type for the function.
 * - GenerateNextGenArenaImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNextGenArenaImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  colorPalette: z.string().describe('The selected accent color for the graphic.'),
  humanSubject: z.string().describe('The human subject to feature in the image.'),
  includeIcons: z.boolean().optional().describe('Whether to include game-specific icons or HUD overlays.'),
  includeParticles: z.boolean().optional().describe('Whether to include particle glow effects.'),
  includeQRCode: z.boolean().optional().describe('Whether to include a QR code area.'),
});
export type GenerateNextGenArenaImageInput = z.infer<
  typeof GenerateNextGenArenaImageInputSchema
>;

const TextContentSchema = z.object({
  mainCallout: z.string().describe('A large, bold, uppercase callout text for the top right.'),
  underlineText: z.string().describe('A secondary line of text below the main callout.'),
  website: z.string().describe('A website URL for the top left.'),
  cta: z.string().describe('A call-to-action for the middle right.'),
  brandName: z.string().describe('The brand or event name for the bottom right.'),
});

const GenerateNextGenArenaImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateNextGenArenaImageOutput = z.infer<
  typeof GenerateNextGenArenaImageOutputSchema
>;

export async function generateNextGenArenaImage(
  input: GenerateNextGenArenaImageInput
): Promise<GenerateNextGenArenaImageOutput> {
  return generateNextGenArenaImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateNextGenArenaTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateNextGenArenaImageInputSchema.shape.postIdea })},
  output: {schema: TextContentSchema},
  prompt: `You are a marketing copywriter for an e-sports brand.
Given the following post idea, generate concise, high-energy text for a promotional graphic.

Post Idea: "{{{postIdea}}}"

Generate the following:
1.  A short, bold, uppercase main callout (e.g., "LEVEL UP").
2.  An exciting underline text (e.g., "THE COMPETITION AWAITS").
3.  A plausible website URL (e.g., "www.nextgen-arena.gg").
4.  A direct call-to-action (e.g., "JOIN THE FIGHT").
5.  A cool brand or event name (e.g., "NEXUS GAMING").

Provide the output in the requested JSON format.`,
});

const generateNextGenArenaImageFlow = ai.defineFlow(
  {
    name: 'generateNextGenArenaImageFlow',
    inputSchema: GenerateNextGenArenaImageInputSchema,
    outputSchema: GenerateNextGenArenaImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    let imagePrompt = `Design a modern, high-energy 1:1 square social media graphic for an e-sports event. The composition should be bold, immersive, and high-contrast.

🧱 Layout Foundation:
- Background: A solid dark grey or black background (#0E0E0E).
- Overlay Pattern: Add a subtle repeating pattern of upward-pointing chevrons or arrows in a slightly lighter shade like #1A1A1A. You can also use diagonal halftone gradients or light grid mesh for digital texture.

🎨 Color Palette & Effects:
- Primary Color: Dark grey/black background.
- Accent Color: Use a vibrant "${input.colorPalette}" for highlights, lines, and glows.
- Text Color: Primarily white (#FFFFFF).
- Add a subtle glowing border around the entire graphic in the accent color to create a tech-glow effect.

🧑‍💻 Main Subject:
- Feature this subject: "${input.humanSubject}".
- The subject should be well-lit, with a focused or slightly smiling expression, immersed in gameplay.
- Position the subject left-centered or slightly right-weighted, with only the edge of the monitor visible to enhance immersion.
- Apply a slight background blur behind the subject for focus depth.

🔠 Text & Typographic Hierarchy (Use a bold, uppercase sans-serif font):
- Top Right (Main Callout):
  - Text: "${textContent.mainCallout}" - Large, bold, uppercase.
  - Below it, add a thin horizontal line in the accent color.
  - Under that line, add: "${textContent.underlineText}" in a medium size.
- Top Left (Website):
  - Small, clean white text: "${textContent.website}"
- Middle Right (CTA):
  - Text: "${textContent.cta}" - bold white, slightly spaced. Include a gaming controller icon next to it.
- Bottom Right (Branding):
  - Text: "${textContent.brandName}" - uppercase, clean sans-serif font, larger than the CTA but secondary to the main callout.
`;

    if (input.includeIcons) {
      imagePrompt += `
💡 Enhancements:
- Add game-specific icons or light HUD overlays (e.g., a health bar, XP ring, or FPS counter) in the corners.`;
    }

    if (input.includeParticles) {
      imagePrompt += `
- Include subtle particle glow effects in the accent color, especially near the corners.`;
    }

    if (input.includeQRCode) {
      imagePrompt += `
- Add a placeholder for a QR code with the text "Join Now" near the bottom left corner.`;
    }

    imagePrompt += `

✅ Visual Mood:
- High-tech, cyber-inspired, and ultra-modern.
- Evokes excitement, focus, and a competitive edge.`;


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
