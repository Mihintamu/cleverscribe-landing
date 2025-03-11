
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function UserAnalytics() {
  const [usersCount, setUsersCount] = useState(0);
  const [contentCount, setContentCount] = useState(0);
  const [contentByType, setContentByType] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        // Get total users count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (userError) throw userError;
        
        // Get total content count
        const { count: totalContent, error: contentError } = await supabase
          .from('generated_content')
          .select('*', { count: 'exact', head: true });

        if (contentError) throw contentError;
        
        // Get content by type
        const { data: contentTypes, error: typesError } = await supabase
          .from('generated_content')
          .select('content_type, count')
          .select('content_type')
          .then(async ({ data, error }) => {
            if (error) throw error;
            
            const types = [...new Set(data?.map(item => item.content_type))];
            const typeCounts: Record<string, number> = {};
            
            for (const type of types) {
              const { count, error } = await supabase
                .from('generated_content')
                .select('*', { count: 'exact', head: true })
                .eq('content_type', type);
                
              if (!error) {
                typeCounts[type] = count || 0;
              }
            }
            
            return { 
              data: Object.entries(typeCounts).map(([name, value]) => ({ 
                name: name.replace('_', ' '), 
                value 
              })),
              error: null
            };
          });

        if (typesError) throw typesError;

        setUsersCount(userCount || 0);
        setContentCount(totalContent || 0);
        setContentByType(contentTypes || []);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnalytics();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usersCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Content Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contentCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Content Per User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {usersCount ? (contentCount / usersCount).toFixed(2) : "0"}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Content by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
