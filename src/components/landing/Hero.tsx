
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { ArrowRight, BookText, CheckCircle } from "lucide-react";

export function Hero() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 inset-x-0 h-40 bg-primary/5 -z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute top-20 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl -z-10" />
      
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary animate-fade-in">
                <span className="font-medium">Academic Writing Assistant</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none animate-fade-up [animation-delay:200ms] text-balance">
                Academic Papers <span className="text-primary">Indistinguishable</span> from Human Writing
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl animate-fade-up [animation-delay:400ms] text-balance">
                Our AI writes authentic academic papers tailored to your needs, with natural language patterns that pass all plagiarism and AI detection tools.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row animate-fade-up [animation-delay:600ms]">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="font-medium">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button size="lg" variant="outline" className="font-medium">
                View Examples <BookText className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-4 animate-fade-up [animation-delay:800ms]">
              {["Human-like writing", "Passes AI detectors", "Fully referenced"].map((item, i) => (
                <div key={i} className="flex items-center gap-1 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:order-last relative">
            <div className="relative h-[450px] md:h-[600px] bg-gradient-to-br from-primary/5 to-primary/20 rounded-xl p-4 sm:p-6 md:p-8 overflow-hidden animate-fade-in [animation-delay:500ms] shadow-xl">
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm glass-panel rounded-xl" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">ScholarAI Editor</div>
                </div>
                
                <div className="flex-1 bg-white rounded-md border border-border p-4 overflow-hidden font-mono text-xs sm:text-sm leading-relaxed">
                  <p className="text-muted-foreground mb-2">/// Generating academic paper on:</p>
                  <p className="text-lg font-semibold font-sans mb-4">The Impact of Climate Change on Global Food Security</p>
                  
                  <div className="space-y-3 animate-pulse-slow">
                    <p>The interrelationship between climate change and food security represents one of the most pressing challenges of the 21st century. As global temperatures continue to rise, the stability of agricultural systems faces unprecedented threats, particularly in regions already vulnerable to food insecurity.</p>
                    <p>Recent meta-analyses of climate impact studies suggest that for every degree Celsius of warming, global grain yields may decline by approximately 10%, with variations across crops and regions (Zhang et al., 2021).</p>
                    <p>This paper examines the multidimensional impacts of climate change on food production, distribution, and accessibility, while evaluating the efficacy of proposed adaptive strategies…</p>
                  </div>
                  
                  <div className="h-4 w-24 bg-foreground/10 rounded animate-pulse mt-4"></div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Original content · Passes AI detection</div>
                  <div className="text-sm font-medium text-primary">100% Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
