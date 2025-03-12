
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  setIsLogin: (value: boolean) => void;
}

export function LoginForm({ setIsLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Log detailed info for debugging
      console.log("Attempting to sign in with:", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid email or password. Please try again.",
        });
        setLoading(false);
        return;
      }

      if (data?.session) {
        console.log("Login successful, session:", data.session);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      } else {
        console.warn("No session returned after login");
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Could not create a session. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className="text-primary hover:underline"
        >
          Need an account? Sign up
        </button>
      </div>
    </>
  );
}
