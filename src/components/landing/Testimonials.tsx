
import { cn } from "@/lib/utils";
import { BlurImage } from "../ui/BlurImage";
import { Quote } from "lucide-react";

interface TestimonialProps {
  content: string;
  author: {
    name: string;
    title: string;
    avatar?: string;
  };
  className?: string;
}

function Testimonial({ content, author, className }: TestimonialProps) {
  return (
    <div className={cn(
      "flex flex-col p-6 bg-white rounded-xl shadow-sm border border-border relative animate-fade-up",
      className
    )}>
      <Quote className="h-10 w-10 text-primary/20 absolute -top-4 -left-2" />
      <blockquote className="relative z-10 text-foreground mb-4 mt-3">
        "{content}"
      </blockquote>
      <div className="flex items-center gap-4 mt-auto">
        {author.avatar && (
          <div className="rounded-full overflow-hidden h-10 w-10">
            <BlurImage
              src={author.avatar}
              alt={author.name}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div>
          <div className="font-medium">{author.name}</div>
          <div className="text-sm text-muted-foreground">{author.title}</div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const testimonials = [
    {
      content: "ScholarAI helped me complete my dissertation when I was facing a tight deadline. The paper was exceptionally well-written and passed all originality checks. My advisor was impressed with the quality of research and writing.",
      author: {
        name: "Alex Johnson",
        title: "PhD Candidate, Biology",
        avatar: "https://i.pravatar.cc/150?img=11"
      }
    },
    {
      content: "I was skeptical at first, but ScholarAI delivered a research paper that was genuinely impressive. It had the natural flow of human writing with perfect citations, and it helped me maintain my 4.0 GPA during a particularly challenging semester.",
      author: {
        name: "Michelle Lee",
        title: "Master's Student, Literature",
        avatar: "https://i.pravatar.cc/150?img=5"
      }
    },
    {
      content: "As a non-native English speaker, academic writing has always been challenging for me. ScholarAI helped me overcome this barrier with perfectly written papers that express complex ideas clearly and professionally.",
      author: {
        name: "Carlos Mendez",
        title: "International Student, Economics",
        avatar: "https://i.pravatar.cc/150?img=12"
      }
    },
    {
      content: "The ability to generate multiple drafts and revisions saved me countless hours. Each version was better than the last, and the final paper received exceptional feedback from my professor. Truly a game-changer for serious students.",
      author: {
        name: "Taylor Williams",
        title: "Undergraduate, Psychology",
        avatar: "https://i.pravatar.cc/150?img=20"
      }
    },
    {
      content: "What impressed me most was how ScholarAI integrated the latest research papers into my literature review. The citations were perfect, and the analysis showed a deep understanding of my field that I honestly didn't expect from AI.",
      author: {
        name: "David Zhao",
        title: "Doctoral Researcher, Computer Science",
        avatar: "https://i.pravatar.cc/150?img=15"
      }
    },
    {
      content: "I used ScholarAI to help me write a complex engineering paper that required technical precision. The result was outstanding - clear explanations of difficult concepts with proper terminology and no AI detection flags.",
      author: {
        name: "Sarah Patel",
        title: "Engineering Graduate Student",
        avatar: "https://i.pravatar.cc/150?img=9"
      }
    }
  ];
  
  return (
    <section id="testimonials" className="py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <span className="font-medium">Success Stories</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-balance">
              What Our Users Are Saying
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl text-balance">
              Join thousands of students and researchers who have transformed their academic writing with our AI assistant.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              content={testimonial.content}
              author={testimonial.author}
              className={`[animation-delay:${200 + index * 100}ms]`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
