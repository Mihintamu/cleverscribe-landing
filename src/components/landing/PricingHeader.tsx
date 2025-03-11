
export function PricingHeader() {
  return (
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
  );
}
