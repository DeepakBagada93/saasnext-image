'use server';
/**
 * @fileOverview Generates the first slide of a multi-slide carousel.
 *
 * - generateMultiSlideCarouselImage - A function that generates the image.
 * - GenerateMultiSlideCarouselImageInput - The input type for the function.
 * - GenerateMultiSlideCarouselImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMultiSlideCarouselImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  niche: z.string().describe('The target niche for the carousel (Web Development, Lead Generation, or AI Solutions).'),
  accentColor: z.string().describe('The accent color for the transformation effect.'),
});
export type GenerateMultiSlideCarouselImageInput = z.infer<
  typeof GenerateMultiSlideCarouselImageInputSchema
>;

const TextContentSchema = z.object({
  hook: z.string().describe('A bold, high-impact hook for the carousel slide.'),
  subheading: z.string().describe('A supporting subheading that clarifies the transformation.'),
});

const GenerateMultiSlideCarouselImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated carousel slide image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateMultiSlideCarouselImageOutput = z.infer<
  typeof GenerateMultiSlideCarouselImageOutputSchema
>;

export async function generateMultiSlideCarouselImage(
  input: GenerateMultiSlideCarouselImageInput
): Promise<GenerateMultiSlideCarouselImageOutput> {
  return generateMultiSlideCarouselImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateCarouselTextContentPrompt',
  input: {schema: z.object({ postIdea: GenerateMultiSlideCarouselImageInputSchema.shape.postIdea, niche: GenerateMultiSlideCarouselImageInputSchema.shape.niche })},
  output: {schema: TextContentSchema},
  prompt: `You are a top-tier marketing strategist specializing in B2B tech.
Based on the following post idea and niche, generate a powerful hook and subheading for the first slide of an Instagram carousel.

Post Idea: "{{{postIdea}}}"
Niche: "{{{niche}}}"

Generate the following:
1.  A bold, high-impact hook that describes a transformation from a negative state to a positive one. (e.g., "FROM CHAOS TO CONVERSION").
2.  A supporting subheading that clarifies the value proposition. (e.g., "Our solutions turn broken user experiences into seamless brilliance.").

The tone should be authoritative and compelling. Provide the output in the requested JSON format.`,
});

const generateMultiSlideCarouselImageFlow = ai.defineFlow(
  {
    name: 'generateMultiSlideCarouselImageFlow',
    inputSchema: GenerateMultiSlideCarouselImageInputSchema,
    outputSchema: GenerateMultiSlideCarouselImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({ postIdea: input.postIdea, niche: input.niche });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    let frustrationScene = '';
    let flawlessScene = '';

    switch (input.niche) {
        case 'Web Development':
            frustrationScene = `A glitchy, pixelated, slow-loading website on an old-style desktop monitor. Show UI lag indicators, 404 error messages, distorted loading spinners, and missing image icons. The scene should be dark, chaotic, and desaturated.`;
            flawlessScene = `A sleek, ultra-modern website interface on a transparent, futuristic floating screen. Show smooth UI cards, glowing buttons, and animated microinteractions. The scene is bright, high-tech, and optimistic.`;
            break;
        case 'Lead Generation':
            frustrationScene = `A broken, leaking sales funnel with leads (represented by glowing orbs) falling out. The visual includes a complex, confusing form with red error messages and a frustrated user silhouette. The mood is dark and discouraging.`;
            flawlessScene = `An automated, glowing pipeline overflowing with qualified leads flowing into a CRM dashboard. The visual includes a simple, one-click conversion button and a happy, relaxed user silhouette. The mood is vibrant and successful.`;
            break;
        case 'AI Solutions':
            frustrationScene = `A person overwhelmed by manual data entry, surrounded by stacks of paper, confusing spreadsheets, and tangled charts. The visual style is chaotic, cluttered, and uses dull, cold colors.`;
            flawlessScene = `An intelligent, automated AI dashboard displaying clear insights and predictive analytics. The visual features clean data visualizations, glowing nodes, and a calm professional overseeing the automated process. The style is futuristic and efficient.`;
            break;
    }

    const imagePrompt = `Design Slide 1 of a bold, eclectic multi-slide carousel for a B2B tech brand. The image must be a square 1:1 aspect ratio. The style is eclectic maximalism with surrealist undertones, high contrast, and layered 3D depth.

🔀 Create a dramatic split-screen composition showing a transformation from left to right.

LEFT SIDE ("The Problem"):
- Visualize this "frustration" scene: ${frustrationScene}

RIGHT SIDE ("The Solution"):
- Visualize this "flawless" scene: ${flawlessScene}

🌈 Center Transformation Effect:
- Connect the two halves with vibrant, morphing ribbons of color that flow from left to right.
- The ribbons should start pixelated and rough on the left and become smooth, clean light streaks on the right.
- Use this color gradient for the ribbons: "${input.accentColor}".
- Add subtle glows and spark trails to the transition.

🔠 Text Overlay (Use a bold, condensed sans-serif font):
- Main Hook (Centered, overlapping both halves): "${textContent.hook}"
- Subheading (Below the hook, smaller font): "${textContent.subheading}"
- The text color should be light on the dark left side and dark on the bright right side for maximum contrast.

🖌️ Overall Style:
- Use layered textures, gradients, glassmorphism, and surreal 3D elements to create depth.
- The final image must be visually arresting, clearly communicating a dramatic before-and-after transformation for the specified niche: "${input.niche}".`;


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
