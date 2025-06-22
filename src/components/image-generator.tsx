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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast"

import { generateBoldMinimalistImage } from '@/ai/flows/generate-bold-minimalist-image';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  postIdea: z.string().min(10, { message: "Please share a bit more about your idea (min. 10 characters)." }).max(500, { message: "Idea is too long (max. 500 characters)." }),
  style: z.string({ required_error: "Please select a style." }),
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
      style: "bold-minimalist"
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
      if (values.style === 'bold-minimalist') {
        const result = await generateBoldMinimalistImage({ postIdea: values.postIdea });
        if (result.image) {
          setGeneratedImage(result.image);
        } else {
          const errorMessage = "Failed to generate image. The AI did not return an image.";
          setError(errorMessage);
          toast({ title: "Generation Failed", description: errorMessage, variant: "destructive" });
        }
      } else {
        const errorMessage = "Selected style is not supported yet.";
        setError(errorMessage);
        toast({ title: "Unsupported Style", description: errorMessage, variant: "destructive" });
      }
    } catch (e) {
      const errorMessage = "An error occurred while generating the image.";
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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Create Your Visual</CardTitle>
          <CardDescription className="font-body">
            Describe your post and select a style. Our AI will do the rest.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bold-minimalist">Bold Minimalist</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </form>
        </Form>
      </Card>

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
