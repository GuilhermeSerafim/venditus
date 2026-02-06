import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@tremor/react";

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
          "Taxa de Conversão": totals.leads > 0 ? Number(((totals.confirmed / totals.leads) * 100).toFixed(1)) : 0,
        },
        {
          name: "Compareceram",
          "Taxa de Conversão": totals.confirmed > 0 ? Number(((totals.attended / totals.confirmed) * 100).toFixed(1)) : 0,
        },
        {
          name: "Negociação",
          "Taxa de Conversão": totals.attended > 0 ? Number(((totals.negotiation / totals.attended) * 100).toFixed(1)) : 0,
        },
        {
          name: "Compraram",
          "Taxa de Conversão": totals.negotiation > 0 ? Number(((totals.purchased / totals.negotiation) * 100).toFixed(1)) : 0,
        },
      ]
    : [];

  return (
    <Card className="bg-card border-border shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-gold">Taxa de Conversão por Etapa</CardTitle>
      </CardHeader>
      <CardContent>
        {funnelData.length > 0 ? (
          <BarChart
            className="mt-6 h-80"
            data={funnelData}
            index="name"
            categories={["Taxa de Conversão"]}
            colors={["blue"]}
            valueFormatter={(number) => `${number}%`}
            layout="vertical"
            yAxisWidth={100}
          />
        ) : (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground animate-fade-in">
            Nenhum evento cadastrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
