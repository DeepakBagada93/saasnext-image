import { ImageGenerator } from "@/components/image-generator";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background">
      <div className="container relative z-10 mx-auto min-h-screen flex flex-col px-4 py-12 md:py-20">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground sm:text-6xl">
            InstaGenius
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground font-body">
            Turn your ideas into stunning, minimalist social media visuals with the power of AI.
          </p>
        </header>
        <main className="w-full max-w-5xl mx-auto flex-grow">
          <ImageGenerator />
        </main>
        <footer className="text-center mt-16 text-sm text-muted-foreground font-body">
          <p>Powered by AI. Designed for creativity.</p>
        </footer>
      </div>
    </div>
  );
}
