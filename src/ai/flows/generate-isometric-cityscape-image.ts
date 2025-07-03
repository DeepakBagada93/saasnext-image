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
  async (input) => {
    const imagePrompt = `Create an ultra-detailed, isometric 3D render of a futuristic smart city.

    The final image must be a square (1:1) aspect ratio, perfect for a social media post.

    🏙️ City & Map Integration:
    The city emerges organically from a stylized, cut-out landmass of a light blue world map. The surrounding map should be lightly textured and in a light cyan-blue hue (#B3E5FC), with faint outlines of continents. The cut-out region is raised in 3D like a tech land island, casting subtle shadows.

    🏗️ Architecture & Layout:
    Skyscrapers and buildings are in a sleek, futuristic architectural style, primarily in tones of soft grey (#B0BEC5) and white (#FAFAFA). Buildings have bright neon blue highlights (#00B0FF) on windows, roof edges, and bases. Vary building heights and complexity; include some towers with digital screens or antenna-like extensions.

    💻 Tech Stack Integration:
    Place prominent, large 3D tech logos throughout the cityscape: Node.js (3D hexagon, green glow), React.js (atom model, light blue glow), HTML/CSS (3D shields, soft gradients), Next.js (elegant 3D monograms), WordPress 'W' logo (in a central media tower), and MongoDB leaf (near a data park). All logos must emit a subtle blue glow.

    📊 Digital Visual Overlays:
    Add transparent floating screens near buildings showing code snippets, dynamic blue-toned graphs, and abstract UIs. Use glowing circuit patterns along some building bases and rooftops.

    🚗 Smart Roads & Futuristic Transport:
    Roads are labeled "SMART ROADS" with thin, glowing blue lanes. Include a futuristic monorail, a sleek hover-bus, and autonomous cars with cyan-blue underglows. Show moving data patterns along the roads.

    🧍 Central Human Figure:
    A stylized, gender-neutral human figure stands on a central platform or rooftop, facing the skyline, suggesting visionary leadership. A subtle blue light glows around their silhouette.

    🔠 Brand Text Integration:
    Display the bold, 3D company name "${input.companyName}" as a massive architectural structure along the city’s central boulevard, rooftop, or landmark park. The font should be a bold, geometric sans-serif. The color should be white (#FFFFFF) or light grey (#ECEFF1) with a blue neon edge glow. The letters should cast long, dramatic shadows or reflect on glass surfaces.

    🌌 Overall Style & Finishing:
    - Color Palette: Primary colors are light blue, steel grey, and white. The accent is a neon/cyan blue glow (#00B0FF).
    - Background Sky: A soft gradient from twilight navy (#1A237E) to midnight black (#000000) for strong contrast.
    - Effects: Apply a subtle post-processing glow and bloom to emphasize the tech atmosphere.
    - Camera Angle: Isometric (30° to 45°), slightly elevated, with a clear foreground and vanishing point.
    - Rendering: Must be crisp, clean, layered with depth, and high resolution.`;

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
