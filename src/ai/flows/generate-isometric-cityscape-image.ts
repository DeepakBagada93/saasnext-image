'use server';
/**
 * @fileOverview Generates an isometric futuristic cityscape image.
 *
 * - generateIsometricCityscapeImage - A function that generates the image.
 * - GenerateIsometricCityscapeImageInput - The input type for the function.
 * - GenerateIsometricCityscapeImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateIsometricCityscapeImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  companyName: z.string().describe('The company name to display as a landmark.'),
  niche: z
    .string()
    .describe(
      'The target niche for the cityscape (Web Development, Lead Generation, or AI Solutions).'
    ),
});
export type GenerateIsometricCityscapeImageInput = z.infer<
  typeof GenerateIsometricCityscapeImageInputSchema
>;

const GenerateIsometricCityscapeImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated cityscape image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateIsometricCityscapeImageOutput = z.infer<
  typeof GenerateIsometricCityscapeImageOutputSchema
>;

export async function generateIsometricCityscapeImage(
  input: GenerateIsometricCityscapeImageInput
): Promise<GenerateIsometricCityscapeImageOutput> {
  return generateIsometricCityscapeImageFlow(input);
}

const generateIsometricCityscapeImageFlow = ai.defineFlow(
  {
    name: 'generateIsometricCityscapeImageFlow',
    inputSchema: GenerateIsometricCityscapeImageInputSchema,
    outputSchema: GenerateIsometricCityscapeImageOutputSchema,
  },
  async input => {
    let nicheSpecifics = '';

    switch (input.niche) {
      case 'Web Development':
        nicheSpecifics = `
        - **Tech Integration:** Place prominent, large 3D tech logos throughout the cityscape: React.js (atom model, light blue glow), Next.js (elegant 3D monograms), and Node.js (3D hexagon, green glow).
        - **Digital Overlays:** Add transparent floating screens near buildings showing code snippets, dynamic blue-toned graphs, and abstract UIs.
        - **Smart Infrastructure:** Roads are labeled "SMART ROADS" with thin, glowing blue lanes. Include futuristic transport like a monorail and autonomous cars.
        `;
        break;
      case 'Lead Generation':
        nicheSpecifics = `
        - **Conceptual Theme:** The city represents a high-tech marketing and sales funnel.
        - **Tech Integration:** Instead of code logos, feature abstract icons representing different stages of lead generation: A large magnet icon for "Attraction", a funnel icon for "Nurturing", and a glowing checkmark or dollar sign for "Conversion". These icons should be integrated into landmark buildings.
        - **Data Flow:** Show glowing orbs (representing leads) flowing along designated pathways from the outskirts of the city towards a central "Conversion Hub" building.
        - **Digital Overlays:** Floating screens display CRM dashboards, conversion rate graphs, and customer journey maps.
        `;
        break;
      case 'AI Solutions':
        nicheSpecifics = `
        - **Conceptual Theme:** The city functions as a giant neural network or AI brain.
        - **Tech Integration:** Landmark buildings are shaped like glowing nodes. Replace web dev logos with icons representing AI, such as a stylized brain, interconnected neurons, or the TensorFlow/PyTorch logos.
        - **Data Flow:** Luminous data streams and pulsating light pathways connect all the buildings, visualizing data processing and learning.
        - **Digital Overlays:** Floating screens show complex data visualizations, machine learning model graphs, and predictive analytics charts.
        `;
        break;
    }

    const imagePrompt = `Create an ultra-detailed, isometric 3D render of a futuristic smart city.

    The final image must be a square (1:1) aspect ratio, perfect for a social media post.

    The city emerges organically from a stylized, cut-out landmass of a light blue world map. The surrounding map should be lightly textured and in a light cyan-blue hue (#B3E5FC), with faint outlines of continents. The cut-out region is raised in 3D like a tech land island, casting subtle shadows.

    The architecture is sleek and futuristic, in tones of soft grey (#B0BEC5) and white (#FAFAFA), with bright neon blue highlights (#00B0FF) on windows, roof edges, and bases.

    Display the bold, 3D company name "${input.companyName}" as a massive architectural structure along the city’s central boulevard, rooftop, or landmark park. The font should be a bold, geometric sans-serif, colored white (#FFFFFF) or light grey (#ECEFF1) with a blue neon edge glow.

    The background sky is a soft gradient from twilight navy (#1A237E) to midnight black (#000000) for strong contrast.

    Apply a subtle post-processing glow and bloom to emphasize the tech atmosphere. The camera angle is isometric (30° to 45°), slightly elevated, with a clear foreground and vanishing point. The rendering must be crisp, clean, layered with depth, and high resolution.

    **Niche Focus: ${input.niche}**
    ${nicheSpecifics}
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
