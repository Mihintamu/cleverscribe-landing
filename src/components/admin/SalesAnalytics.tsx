
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SalesAnalytics() {
  const [plansData, setPlansData] = useState<any[]>([]);
  const [subscriptionsCount, setSubscriptionsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesAnalytics = async () => {
      try {
        // Get subscription plans
        const { data: plans, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*');

        if (plansError) throw plansError;
        
        // Get user subscriptions
        const { data: subscriptions, error: subscriptionsError } = await supabase
          .from('user_subscriptions')
          .select('*, subscription_plans:plan_id(*)');

        if (subscriptionsError) throw subscriptionsError;
        
        // Calculate total revenue
        let revenue = 0;
        const planCounts: Record<string, number> = {};
        
        if (plans && subscriptions) {
          plans.forEach((plan: any) => {
            planCounts[plan.name] = 0;
          });
          
          subscriptions.forEach((sub: any) => {
            if (sub.subscription_plans) {
              const planName = sub.subscription_plans.name;
              planCounts[planName] = (planCounts[planName] || 0) + 1;
              revenue += sub.subscription_plans.price || 0;
            }
          });
        }
        
        const plansChartData = Object.entries(planCounts).map(([name, count]) => ({
          name,
          count
        }));

        setPlansData(plansChartData);
        setSubscriptionsCount(subscriptions?.length || 0);
        setTotalRevenue(revenue);
      } catch (error) {
        console.error("Error fetching sales analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesAnalytics();
  }, []);

  if (loading) {
    return <div>Loading sales analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subscriptionsCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${subscriptionsCount ? (totalRevenue / subscriptionsCount).toFixed(2) : "0"}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions by Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plansData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
