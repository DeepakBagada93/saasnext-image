'use server';
/**
 * @fileOverview Generates a hyper-realistic image of a smartphone in a high-tech workspace.
 *
 * - generateHyperRealisticImage - A function that generates the image.
 * - GenerateHyperRealisticImageInput - The input type for the function.
 * - GenerateHyperRealisticImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateHyperRealisticImageInputSchema = z.object({
  companyName: z.string().describe('The company name to display inside the device screen.'),
  designerName: z.string().describe('The designer or creator name for the signature.'),
  postIdea: z.string().describe('The core idea or theme to represent inside the device screen. This will influence the micro-world elements.'),
  niche: z.string().describe('The target niche for the scene (Web Development, Lead Generation, or AI Solutions).'),
  deviceType: z.string().describe('The type of device to feature (Smartphone, Laptop, or Tablet).'),
});
export type GenerateHyperRealisticImageInput = z.infer<
  typeof GenerateHyperRealisticImageInputSchema
>;

const GenerateHyperRealisticImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated hyper-realistic image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateHyperRealisticImageOutput = z.infer<
  typeof GenerateHyperRealisticImageOutputSchema
>;

export async function generateHyperRealisticImage(
  input: GenerateHyperRealisticImageInput
): Promise<GenerateHyperRealisticImageOutput> {
  return generateHyperRealisticImageFlow(input);
}

const generateHyperRealisticImageFlow = ai.defineFlow(
  {
    name: 'generateHyperRealisticImageFlow',
    inputSchema: GenerateHyperRealisticImageInputSchema,
    outputSchema: GenerateHyperRealisticImageOutputSchema,
  },
  async (input) => {
    let deviceDescription = '';
    switch (input.deviceType) {
        case 'Laptop':
            deviceDescription = 'a sleek, modern laptop placed on a reflective black glass surface';
            break;
        case 'Tablet':
            deviceDescription = 'a slim, professional tablet, with a stylus resting beside it, placed on a reflective black glass surface';
            break;
        case 'Smartphone':
        default:
            deviceDescription = 'a sleek, modern smartphone placed on a reflective black glass surface';
            break;
    }

    let microWorldDescription = '';
    switch (input.niche) {
        case 'Lead Generation':
            microWorldDescription = `
- A visualized sales funnel with glowing orbs (leads) flowing through it.
- Animated dashboards showing conversion rates and customer journey maps.
- Floating UI cards with email campaign previews and A/B test results.
- Icons for CRM platforms, marketing automation tools, and analytics software orbiting the scene.`;
            break;
        case 'AI Solutions':
            microWorldDescription = `
- A glowing, 3D neural network with pulsating nodes and data streams.
- Interactive charts displaying predictive analytics and machine learning model performance.
- Floating screens showing Python code for data science libraries like TensorFlow or PyTorch.
- Abstract icons representing AI, data processing, and automation orbiting the scene.`;
            break;
        case 'Web Development':
        default:
            microWorldDescription = `
- Live UI mockups of websites and apps layered like floating panels.
- Animated HTML/CSS/JavaScript code snippets scrolling across curved digital layers.
- Elements like a loading spinner, dashboard widgets, responsive grids, and mobile menu animations.
- Icons for SEO, analytics, eCommerce, SaaS, and CMS platforms orbiting slowly around the screen’s edge.`;
            break;
    }

    const imagePrompt = `Create a hyper-realistic DSLR-quality photo of ${deviceDescription} in a high-tech, neon-lit workspace. The image must be a square (1:1) aspect ratio. The background should feature blurred UI monitors, lines of glowing code, subtle reflections from light panels, and soft digital ambiance — giving the setting a clean, cutting-edge, futuristic startup studio vibe.

The ${input.deviceType.toLowerCase()} screen must be powered on, displaying a dynamic 3D micro-world inside the device representing the digital solutions concept of: "${input.postIdea}". This micro-world, tailored for "${input.niche}", should include:
${microWorldDescription}

The company name "${input.companyName}" must be boldly displayed in glowing 3D text, seamlessly integrated into the digital landscape — perhaps hovering above the mockups or embedded within a floating UI card.

Around the ${input.deviceType.toLowerCase()}, gently reflected on the glossy black table, show holographic data rays, subtle matrix-like overlays, or glowing charts suggesting innovation and intelligence.

Discreetly on the glass surface near the device, include the phrase:
“Designed by ${input.designerName}” in a minimal, elegant font — giving it the feel of a high-end design signature.

The lighting should be a rich combination of neon blues, soft purples, and ambient whites, creating contrast between the ${input.deviceType.toLowerCase()}’s glow and the surrounding darkness. Capture tactile detail — smudges on the screen, the material finish of the device, soft reflections, and deep shadows — for cinematic realism.

This image should feel like the viewer is witnessing the digital future being built inside a device, and ${input.companyName} is the architect behind it all — where innovation meets beautiful design.`;

    const { media } = await ai.generate({
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
