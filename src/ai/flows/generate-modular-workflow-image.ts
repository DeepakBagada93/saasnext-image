'use server';
/**
 * @fileOverview Generates a modular workflow graphic for tech brands.
 *
 * - generateModularWorkflowImage - A function that generates the image.
 * - GenerateModularWorkflowImageInput - The input type for the function.
 * - GenerateModularWorkflowImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateModularWorkflowImageInputSchema = z.object({
  postIdea: z.string().describe('The idea for the social media post.'),
  niche: z
    .string()
    .describe(
      'The target niche (Web Development, Lead Generation, or AI Solutions).'
    ),
  theme: z.string().describe('The visual theme (Light Mode or Dark Gradient).'),
  layout: z
    .string()
    .describe('The layout of the workflow diagram (Horizontal or Vertical).'),
  strategyIcon: z.string().describe('The icon for the "Strategy" step.'),
  ideationIcon: z.string().describe('The icon for the "Ideation" step.'),
  launchIcon: z.string().describe('The icon for the "Launch" step.'),
});
export type GenerateModularWorkflowImageInput = z.infer<
  typeof GenerateModularWorkflowImageInputSchema
>;

const TextContentSchema = z.object({
  headline: z
    .string()
    .describe('A clear, concise headline for the workflow graphic.'),
  subheadline: z
    .string()
    .describe('A supporting subheadline that explains the process.'),
});

const GenerateModularWorkflowImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      "The generated workflow image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type GenerateModularWorkflowImageOutput = z.infer<
  typeof GenerateModularWorkflowImageOutputSchema
>;

export async function generateModularWorkflowImage(
  input: GenerateModularWorkflowImageInput
): Promise<GenerateModularWorkflowImageOutput> {
  return generateModularWorkflowImageFlow(input);
}

const textContentPrompt = ai.definePrompt({
  name: 'generateModularWorkflowTextContentPrompt',
  input: {
    schema: z.object({
      postIdea: GenerateModularWorkflowImageInputSchema.shape.postIdea,
      niche: GenerateModularWorkflowImageInputSchema.shape.niche,
    }),
  },
  output: {schema: TextContentSchema},
  prompt: `You are a marketing strategist for a B2B tech firm.
Based on the following post idea and niche, generate a compelling headline and subheadline for a workflow diagram.

Post Idea: "{{{postIdea}}}"
Niche: "{{{niche}}}"

Generate the following:
1.  A short, powerful headline summarizing the workflow (e.g., "From Idea to Impact").
2.  A concise subheadline explaining the benefit of the process (e.g., "Our framework for building winning products.").

Provide the output in the requested JSON format.`,
});

const generateModularWorkflowImageFlow = ai.defineFlow(
  {
    name: 'generateModularWorkflowImageFlow',
    inputSchema: GenerateModularWorkflowImageInputSchema,
    outputSchema: GenerateModularWorkflowImageOutputSchema,
  },
  async input => {
    const {output: textContent} = await textContentPrompt({
      postIdea: input.postIdea,
      niche: input.niche,
    });

    if (!textContent) {
      throw new Error('Failed to generate text content.');
    }

    let themeInstructions = '';
    if (input.theme === 'Light Mode') {
      themeInstructions = `💡 Light Mode Theme:
- Background: Pure white (#FFFFFF).
- Shapes: Cool greys (#C4C4C4).
- Connectors: Muted green (#00B894).
- Typography: Charcoal black (#333333).
- Highlight Color: Muted green (#00B894).`;
    } else {
      // Dark Gradient
      themeInstructions = `🌌 Dark Gradient Theme:
- Background: A rich dark gradient from #121212 to #1E1E2F.
- Shapes: Semi-transparent grey (#444444) with a subtle glow.
- Connectors: Neon green (#00FFB2) or cyan (#00FFFF), with a glowing effect.
- Typography: White (#FFFFFF).
- Highlight Color: Neon green (#00FFB2).`;
    }

    const imagePrompt = `Design a modern, minimalist workflow graphic for a social media post (1:1 square). The style should be clean, abstract, and professional, suitable for a tech brand in the "${input.niche}" space.

${themeInstructions}

🧩 Diagram Layout:
- Arrange three geometric shapes (circles or squares) in a ${input.layout} layout.
- Connect them with thin, elegant lines or arrows in the connector color.

- Step 1 Shape: Contains a minimalist icon for Strategy: ${input.strategyIcon}. Label it "Strategy".
- Step 2 Shape: Contains a minimalist icon for Ideation: ${input.ideationIcon}. Label it "Ideation".
- Step 3 Shape: Contains a minimalist icon for Launch: ${input.launchIcon}. Label it "Launch".
- The labels should be clean, small text below each icon.

👨‍💻 Developer Element:
- Position a cleanly illustrated, confident developer sitting with a laptop in the bottom-right corner.
- The laptop screen can show a UI mockup or lines of code.
- The style should be minimalist and blend with the overall theme.

✍️ Headline & Hook:
- Headline: "${textContent.headline}". Use a bold, modern sans-serif font. The main keywords can be highlighted with the highlight color.
- Subheadline: "${textContent.subheadline}". Place this in a smaller, regular-weight font below the headline.
- Position the text block at the top-left to balance the developer element.

✅ Overall Feel:
- The design must be clean, sophisticated, and easy to understand.
- It should communicate a clear, efficient process for the specified niche: "${input.niche}".`;

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
