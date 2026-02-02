import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  "lead": "#F2C94C",
  "cliente_ativo": "#27AE60",
  "ex_cliente": "#EF4444",
};

export const LeadStatusChart = () => {
  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("status");
      if (error) throw error;
      return data;
    },
  });

  const statusCounts = leads?.reduce((acc: any, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const statusLabels: Record<string, string> = {
    lead: "Lead Novo",
    cliente_ativo: "Cliente Ativo",
    ex_cliente: "Ex-Cliente",
  };

  const chartData = Object.entries(statusCounts || {}).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count as number,
    color: COLORS[status as keyof typeof COLORS] || "#64748B",
  })).filter(item => item.value > 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-gold">Distribuição de Leads por Status</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: string) => [`${value} leads`, name]}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};
