
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AuthButtons } from "./auth/AuthButtons";
import { Menu, X, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 py-4 transition-all duration-300",
        isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between">
        <a href="/" className="text-xl font-semibold">
          <span className="text-primary">Scholar</span>AI
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#testimonials" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Testimonials
          </a>
          <a href="#pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Pricing
          </a>
          {session ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                <UserCircle size={20} />
                Dashboard
              </Link>
            </div>
          ) : (
            <AuthButtons />
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-background z-40 p-6 md:hidden flex flex-col animate-fade-in">
            <nav className="flex flex-col space-y-6 pt-8">
              <a 
                href="#features" 
                className="text-lg font-medium py-2 border-b border-border"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                className="text-lg font-medium py-2 border-b border-border"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <a 
                href="#pricing" 
                className="text-lg font-medium py-2 border-b border-border"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              {session ? (
                <Link 
                  to="/dashboard"
                  className="text-lg font-medium py-2 border-b border-border flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircle className="mr-2" size={20} />
                  Dashboard
                </Link>
              ) : (
                <div className="pt-4 flex flex-col gap-3">
                  <Button variant="outline" className="w-full" onClick={() => { 
                    setIsMobileMenuOpen(false);
                    document.querySelector('[aria-label="Login"]')?.dispatchEvent(new MouseEvent('click'));
                  }}>
                    Login
                  </Button>
                  <Button className="w-full" onClick={() => {
                    setIsMobileMenuOpen(false);
                    document.querySelector('[aria-label="Sign Up"]')?.dispatchEvent(new MouseEvent('click'));
                  }}>
                    Sign Up
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
