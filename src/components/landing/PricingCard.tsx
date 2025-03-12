
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { initializeRazorpayPayment } from "@/integrations/razorpay/client";
import { supabase } from "@/integrations/supabase/client";

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!price) {
      toast({
        title: "Free Plan",
        description: "You can start using the free plan right away!",
      });
      return;
    }

    setLoading(true);

    try {
      // Get session to check if user is logged in
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        toast({
          variant: "destructive",
          title: "Login Required",
          description: "Please login to subscribe to a plan",
        });
        setLoading(false);
        return;
      }

      // Fetch Razorpay Key ID from Supabase secrets
      const { data: secretData, error: secretError } = await supabase.functions.invoke('get-razorpay-key', {
        body: { key: 'RAZORPAY_KEY_ID' },
      });

      if (secretError || !secretData?.keyId) {
        console.error("Failed to retrieve Razorpay key:", secretError);
        throw new Error("Failed to retrieve payment information");
      }

      // Initialize Razorpay payment
      initializeRazorpayPayment({
        amount: price,
        planName: name,
        description: `Subscription for ${name} plan`,
        keyId: secretData.keyId,
        onSuccess: async (response) => {
          try {
            // Calculate credits based on plan name
            const credits = name === 'Free' ? 1 : name === 'Basic' ? 8 : 30;
            
            // Get plan_id based on plan name
            let planId: number;
            switch(name.toLowerCase()) {
              case 'free':
                planId = 1;
                break;
              case 'basic':
                planId = 2;
                break;
              case 'premium':
                planId = 3;
                break;
              default:
                planId = 1; // Default to free plan if unknown
            }
            
            // Save payment information to database
            const { error: subscriptionError } = await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: data.session?.user.id,
                plan_name: name.toLowerCase(),
                plan_id: planId,
                payment_id: response.razorpay_payment_id,
                payment_method: 'razorpay',
                amount: price,
                status: 'completed',
                credits_remaining: credits
              });

            if (subscriptionError) {
              console.error("Subscription error:", subscriptionError);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Payment was successful but we couldn't update your subscription. Please contact support.",
              });
            } else {
              toast({
                title: "Success",
                description: `You've successfully subscribed to the ${name} plan!`,
              });
            }
          } catch (err) {
            console.error("Error saving subscription:", err);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Payment was successful but there was an error updating your subscription. Please contact support.",
            });
          } finally {
            setLoading(false);
          }
        },
        onError: (error) => {
          console.error("Razorpay error:", error);
          toast({
            variant: "destructive",
            title: "Payment Failed",
            description: "Unable to process your payment. Please try again.",
          });
          setLoading(false);
        }
      });
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while processing your subscription",
      });
      setLoading(false);
    }
  };

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
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? "Processing..." : `Choose ${name}`}
      </Button>
    </div>
  );
}
