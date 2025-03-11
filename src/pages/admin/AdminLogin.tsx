
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminLogin() {
  const [email, setEmail] = useState("mihintamu@gmail.com");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Verify the access code
      const { data: accessCodes, error: codeError } = await supabase
        .from('admin_access_codes')
        .select('code')
        .eq('code', accessCode)
        .single();

      if (codeError || !accessCodes) {
        throw new Error("Invalid admin access code");
      }

      // Step 2: Create and sign in the admin user if it doesn't exist
      // Check if the admin user exists first by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If the user doesn't exist or the password is incorrect
      if (signInError) {
        // Check if it's a "User not found" error, which means we need to create the user
        if (signInError.message.includes("Invalid login credentials")) {
          // First, sign up the admin user if they don't exist
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) {
            throw new Error(signUpError.message || "Failed to create admin account");
          }

          // Then try to sign in with the created account
          const { error: finalSignInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (finalSignInError) {
            throw new Error(finalSignInError.message || "Failed to sign in with admin account");
          }
        } else {
          // If it's another type of error, throw it
          throw new Error(signInError.message || "Invalid email or password");
        }
      }

      // Step 3: Check if the email matches the admin email
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email !== "mihintamu@gmail.com") {
        // Sign out if not admin user
        await supabase.auth.signOut();
        throw new Error("This account doesn't have admin privileges");
      }

      toast({
        title: "Success!",
        description: "Admin login successful",
      });

      navigate("/admin/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An error occurred during login",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessCode">Admin Access Code</Label>
              <Input
                id="accessCode"
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login to Admin Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
