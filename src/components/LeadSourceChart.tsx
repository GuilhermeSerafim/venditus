import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, Legend } from "@tremor/react";

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

  // Preparar dados para o gráfico Tremor
  const chartData = Object.entries(sourceCounts || {})
    .map(([source, count]) => ({
      name: source,
      value: count as number,
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value); // Ordenar do maior para o menor

  return (
    <Card className="bg-card border-border shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-gold">Origem dos Leads</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData && chartData.length > 0 ? (
          <>
            <DonutChart
              className="mt-6"
              data={chartData}
              category="value"
              index="name"
              colors={["yellow", "blue", "violet", "emerald", "amber", "red", "indigo"]}
              showLabel={true}
              showAnimation={true}
            />
            <Legend
              className="mt-3 flex justify-center"
              categories={chartData.map(item => item.name)}
              colors={["yellow", "blue", "violet", "emerald", "amber", "red", "indigo"]}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground animate-fade-in">
            Nenhum lead cadastrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
