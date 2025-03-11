
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  animationDelay: string;
}

export function PricingCard({ 
  name, 
  price, 
  description, 
  features, 
  isPopular, 
  animationDelay 
}: PricingCardProps) {
  return (
    <div className={`rounded-xl border ${isPopular ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground'} shadow${isPopular ? '-lg' : ''} p-6 relative animate-fade-up`} style={{ animationDelay }}>
      {isPopular && (
        <div className="absolute -top-3 right-4 bg-primary-foreground text-primary px-3 py-1 rounded-full text-xs font-medium">
          Best Value
        </div>
      )}
      <div className="flex flex-col space-y-1.5">
        <h3 className="font-semibold tracking-tight text-2xl">{name}</h3>
        <p className={`text-sm ${isPopular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </div>
      <div className="mt-6 mb-4">
        <span className="text-4xl font-bold">₹{price}</span>
      </div>
      <ul className="mt-4 space-y-3 text-sm">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className={`mr-2 h-4 w-4 ${isPopular ? '' : 'text-primary'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        variant={isPopular ? "secondary" : "default"} 
        className="mt-6 w-full"
      >
        Choose {name}
      </Button>
    </div>
  );
}
