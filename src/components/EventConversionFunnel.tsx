import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STAGE_COLORS = {
  confirmed: "#3B82F6",
  attended: "#8B5CF6",
  negotiation: "#F59E0B",
  purchased: "#10B981",
};

export const EventConversionFunnel = () => {
  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calcular totais agregados de todos os eventos
  const totals = events?.reduce(
    (acc, event) => ({
      leads: acc.leads + (event.leads_count || 0),
      confirmed: acc.confirmed + (event.confirmed_count || 0),
      attended: acc.attended + (event.attended_count || 0),
      negotiation: acc.negotiation + (event.negotiation_count || 0),
      purchased: acc.purchased + (event.purchased_count || 0),
    }),
    { leads: 0, confirmed: 0, attended: 0, negotiation: 0, purchased: 0 }
  );

  const funnelData = totals
    ? [
        {
          name: "Confirmaram",
          value: totals.leads > 0 ? ((totals.confirmed / totals.leads) * 100).toFixed(1) : "0",
          count: totals.confirmed,
          total: totals.leads,
          color: STAGE_COLORS.confirmed,
        },
        {
          name: "Compareceram",
          value: totals.confirmed > 0 ? ((totals.attended / totals.confirmed) * 100).toFixed(1) : "0",
          count: totals.attended,
          total: totals.confirmed,
          color: STAGE_COLORS.attended,
        },
        {
          name: "Negociação",
          value: totals.attended > 0 ? ((totals.negotiation / totals.attended) * 100).toFixed(1) : "0",
          count: totals.negotiation,
          total: totals.attended,
          color: STAGE_COLORS.negotiation,
        },
        {
          name: "Compraram",
          value: totals.negotiation > 0 ? ((totals.purchased / totals.negotiation) * 100).toFixed(1) : "0",
          count: totals.purchased,
          total: totals.negotiation,
          color: STAGE_COLORS.purchased,
        },
      ]
    : [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-semibold">{data.name}</p>
          <p className="text-gold text-lg font-bold">{data.value}%</p>
          <p className="text-muted-foreground text-sm">
            {data.count} de {data.total} leads
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-gold">Taxa de Conversão por Etapa</CardTitle>
      </CardHeader>
      <CardContent>
        {funnelData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[0, 8, 8, 0]}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {funnelData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground animate-fade-in">
            Nenhum evento cadastrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
