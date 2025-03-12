
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WriteContent } from "@/components/dashboard/WriteContent";
import { ContentHistory } from "@/components/dashboard/ContentHistory";
import { UserSettings } from "@/components/dashboard/UserSettings";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "Please login again to continue.",
          });
          navigate("/auth");
          return;
        }
        
        if (!session) {
          // No active session, redirect to login
          navigate("/auth");
          return;
        }
        
        // Check JWT expiration
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        if (expiresAt && expiresAt < now) {
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Your session has expired. Please login again.",
          });
          await supabase.auth.signOut();
          navigate("/auth");
          return;
        }
        
        setSession(session);
      } catch (error) {
        console.error("Error fetching session:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
        });
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Subscribe to auth changes
    const { data: { subscription }} = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_OUT" || !currentSession) {
          navigate("/auth");
          return;
        }
        
        // Refresh session to get updated JWT if token was refreshed
        if (event === "TOKEN_REFRESHED") {
          fetchSession();
          return;
        }
        
        setSession(currentSession);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
        <div className="animate-pulse">Loading your dashboard...</div>
      </div>
    );
  }

  if (!session) {
    return null; // This will avoid a flash before redirecting to auth
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="mt-6">
          <WriteContent userId={session.user.id} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <ContentHistory userId={session.user.id} />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <UserSettings userId={session.user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
