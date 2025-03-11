
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
                Choose Your Content Generation Plan
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl animate-fade-up [animation-delay:400ms] text-balance">
                Select the plan that best fits your content generation needs. Start with our free plan or upgrade for more credits.
              </p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 animate-fade-up [animation-delay:500ms]">
              <div className="flex flex-col space-y-1.5">
                <h3 className="font-semibold tracking-tight text-2xl">Free</h3>
                <p className="text-muted-foreground text-sm">Get started for free</p>
              </div>
              <div className="mt-6 mb-4">
                <span className="text-4xl font-bold">₹0</span>
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
                  <span>1 content generation</span>
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
                  <span>Basic features</span>
                </li>
              </ul>
              <Button className="mt-6 w-full">Start Free</Button>
            </div>

            {/* Basic Plan */}
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 animate-fade-up [animation-delay:600ms]">
              <div className="flex flex-col space-y-1.5">
                <h3 className="font-semibold tracking-tight text-2xl">Basic</h3>
                <p className="text-muted-foreground text-sm">For regular users</p>
              </div>
              <div className="mt-6 mb-4">
                <span className="text-4xl font-bold">₹50</span>
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
                  <span>8 content generations</span>
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
                  <span>All features included</span>
                </li>
              </ul>
              <Button className="mt-6 w-full">Choose Basic</Button>
            </div>

            {/* Premium Plan */}
            <div className="rounded-xl border bg-primary text-primary-foreground shadow-lg p-6 relative animate-fade-up [animation-delay:700ms]">
              <div className="absolute -top-3 right-4 bg-primary-foreground text-primary px-3 py-1 rounded-full text-xs font-medium">
                Best Value
              </div>
              <div className="flex flex-col space-y-1.5">
                <h3 className="font-semibold tracking-tight text-2xl">Premium</h3>
                <p className="text-primary-foreground/80 text-sm">For power users</p>
              </div>
              <div className="mt-6 mb-4">
                <span className="text-4xl font-bold">₹250</span>
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
                  <span>30 content generations</span>
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
                  <span>Priority support</span>
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
                  <span>Advanced features</span>
                </li>
              </ul>
              <Button variant="secondary" className="mt-6 w-full">Choose Premium</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
