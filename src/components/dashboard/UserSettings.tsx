
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { CreditCard, MessageSquare, LogOut } from "lucide-react";

interface UserSettingsProps {
  userId: string;
}

interface ProfileData {
  email: string;
  phone_number: string | null;
}

interface SubscriptionData {
  credits_remaining: number;
  plan: {
    name: string;
    credits: number;
  };
}

export function UserSettings({ userId }: UserSettingsProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        // Fetch subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("user_subscriptions")
          .select(`
            credits_remaining,
            subscription_plans (
              name,
              credits
            )
          `)
          .eq("user_id", userId)
          .single();

        if (subscriptionError) throw subscriptionError;

        setProfile(profileData);
        setPhoneNumber(profileData.phone_number || "");
        setSubscription({
          credits_remaining: subscriptionData.credits_remaining,
          plan: subscriptionData.subscription_plans
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, toast]);

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ phone_number: phoneNumber })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading user settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={profile?.email || ""} 
                disabled 
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="Enter your phone number" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={updating || 
                (profile?.phone_number === phoneNumber && phoneNumber !== "")
              }
            >
              {updating ? "Updating..." : "Update Profile"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Your current subscription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-md">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="font-medium">{subscription?.plan.name} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Total Credits: {subscription?.plan.credits}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-md">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="font-medium">Credits Remaining</p>
                  <p className="text-sm text-muted-foreground">
                    {subscription?.credits_remaining} / {subscription?.plan.credits}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/#pricing')}
            >
              View Pricing Plans
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
