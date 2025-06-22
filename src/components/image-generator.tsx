"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { AlertCircle, Download, ImageIcon, Loader2, Rocket } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

import { generateBoldMinimalistImage } from '@/ai/flows/generate-bold-minimalist-image';
import { generatePixelArtImage } from '@/ai/flows/generate-pixel-art-image';
import { generateTexturedGrainImage } from '@/ai/flows/generate-textured-grain-image';
import { generateMaximalistImage } from '@/ai/flows/generate-maximalist-image';
import { generateHandcraftedImage } from '@/ai/flows/generate-handcrafted-image';
import { generateAbstractCollageImage } from '@/ai/flows/generate-abstract-collage-image';
import { generateCorporateGradientImage } from '@/ai/flows/generate-corporate-gradient-image';
import { generateBoldTypographicImage } from '@/ai/flows/generate-bold-typographic-image';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  postIdea: z.string().min(10, { message: "Please share a bit more about your idea (min. 10 characters)." }).max(500, { message: "Idea is too long (max. 500 characters)." }),
  style: z.string({ required_error: "Please select a style." }),
  colorPalette: z.string().optional(),
  fontStyle: z.string().optional(),
  imageElements: z.string().optional(),
  sceneDescription: z.string().optional(),
  illustrativeMotifs: z.string().optional(),
  emotiveTheme: z.string().optional(),
  humanSubject: z.string().optional(),
  includeQRCode: z.boolean().optional(),
}).refine((data) => {
    if (data.style === 'bold-minimalist') {
      return !!data.colorPalette;
    }
    return true;
  }, {
    message: "Color palette is required for this style.",
    path: ["colorPalette"],
  })
  .refine((data) => {
    if (data.style === 'bold-minimalist') {
      return !!data.fontStyle;
    }
    return true;
  }, {
    message: "Font style is required for this style.",
    path: ["fontStyle"],
  })
  .refine((data) => {
    if (data.style === 'pixel-retro-futurism') {
      return !!data.colorPalette;
    }
    return true;
  }, {
    message: "Color palette is required for this style.",
    path: ["colorPalette"],
  })
  .refine((data) => {
    if (data.style === 'textured-grain') {
      return !!data.colorPalette;
    }
    return true;
  }, {
    message: "Color palette is required for this style.",
    path: ["colorPalette"],
  })
  .refine((data) => {
    if (data.style === 'maximalist-illustration') {
      return !!data.sceneDescription;
    }
    return true;
  }, {
    message: "A scene example is required for this style.",
    path: ["sceneDescription"],
  })
  .refine((data) => {
    if (data.style === 'handcrafted') {
      return !!data.illustrativeMotifs;
    }
    return true;
  }, {
    message: "An illustrative motif is required for this style.",
    path: ["illustrativeMotifs"],
  })
  .refine((data) => {
    if (data.style === 'abstract-figurative-collage') {
      return !!data.emotiveTheme;
    }
    return true;
  }, {
    message: "An emotive theme is required for this style.",
    path: ["emotiveTheme"],
  })
  .refine((data) => {
    if (data.style === 'dynamic-corporate-gradient') {
      return !!data.colorPalette;
    }
    return true;
  }, {
    message: "A gradient palette is required for this style.",
    path: ["colorPalette"],
  })
  .refine((data) => {
    if (data.style === 'dynamic-corporate-gradient') {
      return !!data.humanSubject;
    }
    return true;
  }, {
    message: "A human subject is required for this style.",
    path: ["humanSubject"],
  });


export function ImageGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postIdea: "",
      style: "bold-minimalist",
      colorPalette: "navy-orange",
      fontStyle: "modern-sans-serif",
      imageElements: "",
      sceneDescription: undefined,
      illustrativeMotifs: undefined,
      emotiveTheme: undefined,
      humanSubject: undefined,
      includeQRCode: false,
    }
  });

  const selectedStyle = form.watch("style");

  const resetOptionalFields = () => {
    form.setValue('colorPalette', undefined, { shouldValidate: true });
    form.setValue('fontStyle', undefined, { shouldValidate: true });
    form.setValue('imageElements', '', { shouldValidate: true });
    form.setValue('sceneDescription', undefined, { shouldValidate: true });
    form.setValue('illustrativeMotifs', undefined, { shouldValidate: true });
    form.setValue('emotiveTheme', undefined, { shouldValidate: true });
    form.setValue('humanSubject', undefined, { shouldValidate: true });
    form.setValue('includeQRCode', false, { shouldValidate: true });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
      if (values.style === 'bold-minimalist') {
        const result = await generateBoldMinimalistImage({ 
          postIdea: values.postIdea,
          colorPalette: values.colorPalette!,
          fontStyle: values.fontStyle!,
          imageElements: values.imageElements,
        });
        if (result.image) {
          setGeneratedImage(result.image);
        } else {
          throw new Error("The AI did not return an image.");
        }
      } else if (values.style === 'pixel-retro-futurism') {
        const result = await generatePixelArtImage({ 
          postIdea: values.postIdea,
          colorPalette: values.colorPalette!,
          imageElements: values.imageElements,
        });
        if (result.image) {
          setGeneratedImage(result.image);
        } else {
          throw new Error("The AI did not return an image.");
        }
      } else if (values.style === 'textured-grain') {
        const result = await generateTexturedGrainImage({
          postIdea: values.postIdea,
          colorPalette: values.colorPalette!,
          imageElements: values.imageElements,
        });
        if (result.image) {
          setGeneratedImage(result.image);
        } else {
          throw new Error("The AI did not return an image.");
        }
      } else if (values.style === 'maximalist-illustration') {
        const result = await generateMaximalistImage({
          postIdea: values.postIdea,
          sceneDescription: values.sceneDescription!,
        });
        if (result.image) {
          setGeneratedImage(result.image);
        } else {
          throw new Error("The AI did not return an image.");
        }
      } else if (values.style === 'handcrafted') {
        const result = await generateHandcraftedImage({
          postIdea: values.postIdea,
          illustrativeMotifs: values.illustrativeMotifs!,
        });
        if (result.image) {
          setGeneratedImage(result.image);
        } else {
          throw new Error("The AI did not return an image.");
        }
      } else if (values.style === 'abstract-figurative-collage') {
        const result = await generateAbstractCollageImage({
          postIdea: values.postIdea,
          emotiveTheme: values.emotiveTheme!,
        });
        if (result.image) {
          setGeneratedImage(result.image);
        } else {
          throw new Error("The AI did not return an image.");
        }
      } else if (values.style === 'dynamic-corporate-gradient') {
        const result = await generateCorporateGradientImage({
          postIdea: values.postIdea,
          colorPalette: values.colorPalette!,
          humanSubject: values.humanSubject!,
          includeQRCode: values.includeQRCode,
        });
        if (result.image) {
          setGeneratedImage(result.image);
        } else {
          throw new Error("The AI did not return an image.");
        }
      } else if (values.style === 'bold-typographic-impact') {
        const result = await generateBoldTypographicImage({
          postIdea: values.postIdea,
        });
        if (result.image) {
          setGeneratedImage(result.image);
        } else {
          throw new Error("The AI did not return an image.");
        }
      } else {
        const errorMessage = "Selected style is not supported yet.";
        setError(errorMessage);
        toast({ title: "Unsupported Style", description: errorMessage, variant: "destructive" });
      }
    } catch (e: any) {
      const errorMessage = e.message || "An error occurred while generating the image.";
      setError(errorMessage);
      toast({ title: "Generation Error", description: "Something went wrong. Please try again later.", variant: "destructive" });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'instagenius-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Create Your Visual</CardTitle>
              <CardDescription className="font-body">
                Describe your post and select a style. Our AI will do the rest.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="postIdea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Idea</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A motivational quote about perseverance for entrepreneurs."
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Style</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        resetOptionalFields();
                        if (value === 'bold-minimalist') {
                          form.setValue('colorPalette', 'navy-orange');
                          form.setValue('fontStyle', 'modern-sans-serif');
                        } else if (value === 'pixel-retro-futurism') {
                          form.setValue('colorPalette', 'Neon Pink & Electric Blue');
                        } else if (value === 'textured-grain') {
                          form.setValue('colorPalette', 'muted-tones');
                        } else if (value === 'maximalist-illustration') {
                           form.setValue('sceneDescription', 'A flourishing creative studio overrun with plants, tools, books, and glowing objects');
                        } else if (value === 'handcrafted') {
                          form.setValue('illustrativeMotifs', 'A hand holding a pencil');
                        } else if (value === 'abstract-figurative-collage') {
                          form.setValue('emotiveTheme', 'Identity / Self-expression');
                        } else if (value === 'dynamic-corporate-gradient') {
                          form.setValue('colorPalette', 'Deep blue to vibrant orange/yellow');
                          form.setValue('humanSubject', 'A confident businessperson smiling');
                          form.setValue('includeQRCode', false);
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bold-minimalist">Bold Minimalist</SelectItem>
                        <SelectItem value="pixel-retro-futurism">Pixel Retro-Futurism</SelectItem>
                        <SelectItem value="textured-grain">Textured Grain</SelectItem>
                        <SelectItem value="maximalist-illustration">Maximalist Illustration</SelectItem>
                        <SelectItem value="handcrafted">Handcrafted</SelectItem>
                        <SelectItem value="abstract-figurative-collage">Abstract Figurative Collage</SelectItem>
                        <SelectItem value="dynamic-corporate-gradient">Dynamic Corporate Gradient</SelectItem>
                        <SelectItem value="bold-typographic-impact">Bold Typographic Impact</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedStyle === 'bold-minimalist' && (
                <>
                  <FormField
                    control={form.control}
                    name="colorPalette"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Palette</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a color palette" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="navy-orange">Navy & Orange</SelectItem>
                            <SelectItem value="black-gold">Black & Gold</SelectItem>
                            <SelectItem value="teal-white">Teal & White</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fontStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a font style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="modern-sans-serif">Modern Sans-Serif</SelectItem>
                            <SelectItem value="classic-serif">Classic Serif</SelectItem>
                            <SelectItem value="bold-display">Bold Display</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageElements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Elements (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., upward arrow, bar chart, subtle gears"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Describe key visuals for the AI to include.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {selectedStyle === 'pixel-retro-futurism' && (
                <>
                  <FormField
                    control={form.control}
                    name="colorPalette"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Palette</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a color palette" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Neon Pink & Electric Blue">Neon Pink & Electric Blue</SelectItem>
                            <SelectItem value="Bright Yellow & VHS Green">Bright Yellow & VHS Green</SelectItem>
                            <SelectItem value="Electric Blue & Bright Yellow">Electric Blue & Bright Yellow</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageElements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Elements (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., joystick, floppy disk, pixelated dollar sign"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Describe key visuals for the AI to include.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectedStyle === 'textured-grain' && (
                <>
                  <FormField
                    control={form.control}
                    name="colorPalette"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Palette</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a color palette" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="muted-tones">Muted Tones</SelectItem>
                            <SelectItem value="bold-vintage">Bold Vintage</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageElements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Elements (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., rectangle frame, underline bar"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Describe key visuals for the AI to include.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectedStyle === 'maximalist-illustration' && (
                <>
                  <FormField
                    control={form.control}
                    name="sceneDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scene Example</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a scene example" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A flourishing creative studio overrun with plants, tools, books, and glowing objects">Creative Studio</SelectItem>
                            <SelectItem value="A botanical dreamscape with paintbrushes growing from the soil and stars woven into leaves">Botanical Dreamscape</SelectItem>
                            <SelectItem value="A whimsical marketplace filled with icons of creativity (like ideas in jars, fonts on fabrics, or painted animals)">Whimsical Marketplace</SelectItem>
                            <SelectItem value="A character illustration of a whimsical creator surrounded by flowing, fantastical elements related to branding/design">Creator Character</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose a pre-defined scene to generate.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectedStyle === 'handcrafted' && (
                <>
                  <FormField
                    control={form.control}
                    name="illustrativeMotifs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Illustrative Motifs</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a motif" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A hand holding a pencil">Hand holding a pencil</SelectItem>
                            <SelectItem value="Doodle-style lightbulb, leaves, sun">Doodle-style elements</SelectItem>
                            <SelectItem value="Torn paper borders with botanical overlays">Torn paper & botanicals</SelectItem>
                            <SelectItem value="Thumbprint or handprint textures">Thumbprint textures</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose a central theme for the illustration.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectedStyle === 'abstract-figurative-collage' && (
                <>
                  <FormField
                    control={form.control}
                    name="emotiveTheme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emotive Theme</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Identity / Self-expression">Identity / Self-expression</SelectItem>
                            <SelectItem value="Chaos vs. clarity">Chaos vs. clarity</SelectItem>
                            <SelectItem value="Emotion beneath the surface">Emotion beneath the surface</SelectItem>
                            <SelectItem value="Fragmented stories or digital disconnection">Fragmented stories</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose a central theme for the collage.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {selectedStyle === 'dynamic-corporate-gradient' && (
                <>
                  <FormField
                    control={form.control}
                    name="colorPalette"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gradient Palette</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a gradient palette" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Deep blue to vibrant orange/yellow">Blue to Orange</SelectItem>
                            <SelectItem value="Royal purple to sky blue">Purple to Blue</SelectItem>
                            <SelectItem value="Cool teal to steel gray">Teal to Gray</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="humanSubject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Human Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a human subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A confident businessperson smiling">Confident Businessperson</SelectItem>
                            <SelectItem value="A tech specialist using a tablet">Tech Specialist with Tablet</SelectItem>
                            <SelectItem value="A diverse team member with a professional look">Diverse Team Member</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="includeQRCode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Include QR Code Area</FormLabel>
                          <FormDescription>
                            Add a placeholder for a QR code.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      <Card className="shadow-lg min-h-[30rem] flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Your Masterpiece</CardTitle>
          <CardDescription className="font-body">The generated image will appear below.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center p-6 bg-muted/30 rounded-b-lg">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground w-full max-w-xs">
              <Skeleton className="h-64 w-64 rounded-lg" />
              <Skeleton className="h-6 w-48" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive p-4">
              <AlertCircle className="mx-auto h-12 w-12" />
              <p className="mt-4 font-semibold">Generation Failed</p>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : generatedImage ? (
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
              <Image 
                src={generatedImage}
                alt="Generated post image"
                width={400}
                height={400}
                className="rounded-lg shadow-xl border-4 border-card"
                data-ai-hint="social media post"
              />
              <Button onClick={handleDownload} className="mt-4">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-4">
              <ImageIcon className="mx-auto h-16 w-16 mb-4" />
              <p className="font-semibold">Your image will appear here</p>
              <p className="mt-2 text-sm">Let's create something amazing!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
