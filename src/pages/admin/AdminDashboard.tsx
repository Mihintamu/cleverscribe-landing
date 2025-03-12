
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
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/admin");
          return;
        }
        
        // For this simple app, we're using a specific email as admin
        // In a production app, you would check against a role in the database
        if (user.email === "mihintamu@gmail.com") {
          setIsAdmin(true);
        } else {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have admin privileges"
          });
          navigate("/admin");
          return;
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
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
    await supabase.auth.signOut();
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
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
