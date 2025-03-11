
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";

export function CallToAction() {
  return (
    <section id="pricing" className="py-24 bg-primary/5">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary animate-fade-in">
                <span className="font-medium">Pricing Plans</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-up [animation-delay:200ms] text-balance">
                Ready to Transform Your Academic Writing?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl animate-fade-up [animation-delay:400ms] text-balance">
                Choose the plan that works for you and start creating professional, human-like academic papers with our advanced AI technology.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center gap-2 animate-fade-up [animation-delay:600ms]">
                <div className="rounded-full bg-primary/10 p-1 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <span>Create papers indistinguishable from human writing</span>
              </div>
              <div className="flex items-center gap-2 animate-fade-up [animation-delay:700ms]">
                <div className="rounded-full bg-primary/10 p-1 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <span>Safe from all AI detection and plagiarism tools</span>
              </div>
              <div className="flex items-center gap-2 animate-fade-up [animation-delay:800ms]">
                <div className="rounded-full bg-primary/10 p-1 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <span>24/7 support and unlimited revisions</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-up [animation-delay:900ms]">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="font-medium">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button size="lg" variant="outline" className="font-medium">
                Contact Sales
              </Button>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 animate-fade-up [animation-delay:500ms]">
              <div className="flex flex-col space-y-1.5">
                <h3 className="font-semibold tracking-tight text-2xl">Basic</h3>
                <p className="text-muted-foreground text-sm">For individual students</p>
              </div>
              <div className="mt-6 mb-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-primary"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span>3 papers per month</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-primary"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span>Up to 2,000 words per paper</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-primary"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span>Standard citation formats</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-primary"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="mt-6 w-full">Choose Basic</Button>
            </div>
            <div className="rounded-xl border bg-primary text-primary-foreground shadow-lg p-6 relative animate-fade-up [animation-delay:600ms]">
              <div className="absolute -top-3 right-4 bg-primary-foreground text-primary px-3 py-1 rounded-full text-xs font-medium">
                Popular
              </div>
              <div className="flex flex-col space-y-1.5">
                <h3 className="font-semibold tracking-tight text-2xl">Pro</h3>
                <p className="text-primary-foreground/80 text-sm">For serious academics</p>
              </div>
              <div className="mt-6 mb-4">
                <span className="text-4xl font-bold">$79</span>
                <span className="text-primary-foreground/80">/month</span>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span>Unlimited papers</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span>Up to 10,000 words per paper</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span>All citation formats</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span>Priority support 24/7</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span>Advanced research integration</span>
                </li>
              </ul>
              <Button variant="secondary" className="mt-6 w-full">Choose Pro</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
