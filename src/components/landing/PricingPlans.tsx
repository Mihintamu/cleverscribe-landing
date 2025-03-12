
import { PricingCard } from "./PricingCard";

export function PricingPlans() {
  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Get started for free",
      features: ["1 content generation", "Basic features"],
      animationDelay: "500ms"
    },
    {
      name: "Basic",
      price: 499,
      description: "For regular users",
      features: ["8 content generations", "All features included"],
      animationDelay: "600ms"
    },
    {
      name: "Premium",
      price: 2499,
      description: "For power users",
      features: ["30 content generations", "Priority support", "Advanced features"],
      isPopular: true,
      animationDelay: "700ms"
    }
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <PricingCard key={plan.name} {...plan} />
      ))}
    </div>
  );
}
