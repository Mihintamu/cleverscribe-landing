
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function AuthButtons() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent, type: 'login' | 'signup') => {
    e.preventDefault();
    
    // In a real implementation, this would connect to your auth provider
    toast({
      title: type === 'login' ? "Login functionality" : "Signup functionality",
      description: "This will be implemented in the next phase",
    });
    
    if (type === 'login') {
      setIsLoginOpen(false);
    } else {
      setIsSignupOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="font-medium">
            Login
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">Login to your account</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" required />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogTrigger asChild>
          <Button className="font-medium">
            Sign Up
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">Create an account</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" placeholder="Enter your email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" type="password" placeholder="Create a password" required />
            </div>
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
