
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WriteContent } from "@/components/dashboard/WriteContent";
import { ContentHistory } from "@/components/dashboard/ContentHistory";
import { UserSettings } from "@/components/dashboard/UserSettings";
import { Session } from "@supabase/supabase-js";

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!session) {
    return null;
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
