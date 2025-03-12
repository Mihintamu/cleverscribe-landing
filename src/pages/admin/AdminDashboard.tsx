
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserAnalytics } from "@/components/admin/UserAnalytics";
import { SalesAnalytics } from "@/components/admin/SalesAnalytics";
import { SubjectManager } from "@/components/admin/SubjectManager";
import { KnowledgeBaseManager } from "@/components/admin/KnowledgeBaseManager";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('users');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          throw new Error("Authentication error");
        }
        
        if (!session) {
          console.log("No active session, redirecting to admin login");
          navigate("/admin");
          return;
        }
        
        const { user } = session;
        console.log("Checking admin status for user:", user.email);
        
        // For this app, we're using a specific email as admin
        // In a production app, you would check against a role in the database
        if (user.email === "mihintamu@gmail.com") {
          console.log("Admin status confirmed");
          setIsAdmin(true);
        } else {
          console.log("User is not an admin");
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have admin privileges"
          });
          navigate("/admin");
          return;
        }
      } catch (error: any) {
        console.error("Error checking admin status:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message || "Please log in again",
        });
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to sign out. Please try again.",
        });
        return;
      }
      
      navigate("/admin");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // This will prevent flash before redirect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
      </div>
      
      <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="subjects">Subject Management</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <UserAnalytics />
        </TabsContent>
        
        <TabsContent value="sales" className="mt-6">
          <SalesAnalytics />
        </TabsContent>
        
        <TabsContent value="subjects" className="mt-6">
          <SubjectManager />
        </TabsContent>
        
        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeBaseManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
