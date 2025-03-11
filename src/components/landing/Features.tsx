
import { BlurImage } from "../ui/BlurImage";
import { Brain, FileText, ShieldCheck, Microscope, Sparkles, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "relative group p-6 rounded-xl bg-white border border-border shadow-sm transition-all duration-300 hover:shadow-md animate-fade-up",
      className
    )}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-5">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function Features() {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Human-Like Writing",
      description: "Generates content with natural language patterns, varied sentence structures, and authentic academic tone."
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Bypass AI Detection",
      description: "Our technology creates content that passes all major AI detection tools while maintaining academic quality."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Custom Citations",
      description: "Automatically includes proper academic citations in any required format (APA, MLA, Chicago, etc.)."
    },
    {
      icon: <Microscope className="h-6 w-6" />,
      title: "Research Integration",
      description: "Seamlessly incorporates the latest research and data into your papers with accurate citations."
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Subject Expertise",
      description: "Specialized in multiple disciplines including humanities, sciences, business, and engineering."
    },
    {
      icon: <RefreshCcw className="h-6 w-6" />,
      title: "Unlimited Revisions",
      description: "Request as many changes as needed until your paper perfectly meets your requirements."
    }
  ];
  
  return (
    <section id="features" className="py-24 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <span className="font-medium">Advanced Features</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-balance">
              Cutting-Edge Academic Writing
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl text-balance">
              Our AI combines advanced language models with academic expertise to deliver papers indistinguishable from human writing.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              className={`[animation-delay:${200 + index * 100}ms]`}
            />
          ))}
        </div>
        
        <div className="mt-20 rounded-xl overflow-hidden shadow-xl">
          <div className="p-8 bg-white">
            <h3 className="text-2xl font-bold mb-4">How Our Technology Works</h3>
            <p className="text-muted-foreground mb-6">
              ScholarAI creates unique papers by understanding academic writing patterns and seamlessly integrating research. Our multi-stage process ensures quality content that's indistinguishable from human writing.
            </p>
            
            <div className="aspect-video bg-secondary/50 rounded-lg overflow-hidden">
              <BlurImage
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200"
                alt="AI academic writing technology visualization"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
