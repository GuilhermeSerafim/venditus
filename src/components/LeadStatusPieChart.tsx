import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  lead: "#F2C94C",
  cliente_ativo: "#27AE60",
  ex_cliente: "#EF4444",
};

const STATUS_LABELS = {
  lead: "Lead Novo",
  cliente_ativo: "Cliente Ativo",
  ex_cliente: "Ex-Cliente",
};

export const LeadStatusPieChart = () => {
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

  const chartData = Object.entries(statusCounts || {}).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    value: count as number,
    color: COLORS[status as keyof typeof COLORS] || "#64748B",
  })).filter(item => item.value > 0);

  return (
    <Card className="bg-card border-border shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-gold">Status dos Leads</CardTitle>
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
                outerRadius={90}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
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
          <div className="flex items-center justify-center h-[300px] text-muted-foreground animate-fade-in">
            Nenhum lead cadastrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
