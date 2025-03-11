
import { PricingHeader } from "./PricingHeader";
import { PricingPlans } from "./PricingPlans";

export function CallToAction() {
  return (
    <section id="pricing" className="py-24 bg-primary/5">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <PricingHeader />
          <PricingPlans />
        </div>
      </div>
    </section>
  );
}
