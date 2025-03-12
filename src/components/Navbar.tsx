
import { AuthButtons } from "@/components/auth/AuthButtons";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out",
      });
    }
  };

  return (
    <nav className="border-b shadow-sm bg-white">
      <div className="container mx-auto px-4 max-w-6xl flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link to="/" className="font-bold text-xl">ContentGenius</Link>
          
          <div className="hidden md:flex ml-10 space-x-4">
            <Link to="/#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link to="/#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link to="/#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</Link>
          </div>
        </div>
        
        <div className="flex items-center">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          ) : (
            <AuthButtons />
          )}
        </div>
      </div>
    </nav>
  );
}
