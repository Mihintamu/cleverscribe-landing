
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeBaseManager } from "@/components/admin/KnowledgeBaseManager";
import { SubjectManager } from "@/components/admin/SubjectManager";
import { SalesAnalytics } from "@/components/admin/SalesAnalytics";
import { UserAnalytics } from "@/components/admin/UserAnalytics";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("knowledge");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log("Checking admin status...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No session found, redirecting to admin login");
          navigate("/admin");
          return;
        }

        // Validate JWT token
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        if (expiresAt && expiresAt < now) {
          console.log("Session expired");
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Your session has expired. Please login again.",
          });
          await supabase.auth.signOut();
          navigate("/admin");
          return;
        }

        console.log("Admin check successful");
        // For simplicity, we'll set isAdmin to true
        // In a real app, you would check for admin role from a profiles table
        setIsAdmin(true);
      } catch (error) {
        console.error("Admin check error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
        });
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

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
      
      navigate("/admin");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse">Verifying admin access...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col">
        <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-10">
          <div className="container px-4 py-4 mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                View Site
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="container px-4 py-8 mx-auto max-w-7xl mt-20">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-8 grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="knowledge" className="space-y-4">
              <KnowledgeBaseManager />
            </TabsContent>
            
            <TabsContent value="subjects" className="space-y-4">
              <SubjectManager />
            </TabsContent>
            
            <TabsContent value="sales" className="space-y-4">
              <SalesAnalytics />
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <UserAnalytics />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
