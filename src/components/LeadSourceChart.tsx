import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = [
  "#F2C94C", // Gold - Indicação
  "#3B82F6", // Blue - Palestra
  "#8B5CF6", // Purple - Instagram
  "#10B981", // Green - Google
  "#F59E0B", // Amber - Anúncio Pago
  "#EF4444", // Red - Evento Externo
  "#6366F1", // Indigo - Outros
];

export const LeadSourceChart = () => {
  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("lead_source");
      if (error) throw error;
      return data;
    },
  });

  // Agrupar leads por origem e contar
  const sourceCounts = leads?.reduce((acc: Record<string, number>, lead) => {
    const source = lead.lead_source || "Outros";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  // Preparar dados para o gráfico
  const chartData = Object.entries(sourceCounts || {})
    .map(([source, count]) => ({
      name: source,
      value: count as number,
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value); // Ordenar do maior para o menor

  const totalLeads = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-card border-border shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-gold">Origem dos Leads</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => {
                  const percent = ((value / totalLeads) * 100).toFixed(1);
                  return `${name}: ${percent}%`;
                }}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: string) => {
                  const percent = ((value / totalLeads) * 100).toFixed(1);
                  return [`${value} leads (${percent}%)`, name];
                }}
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
