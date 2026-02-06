import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, Legend } from "@tremor/react";

const COLORS: Record<string, string> = {
  lead: "amber",
  cliente_ativo: "emerald",
  ex_cliente: "red",
};

const STATUS_LABELS: Record<string, string> = {
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
  })).filter(item => item.value > 0);

  const finalColors = chartData.map(item => {
      // Find the key (internal status name) for this label
      const key = Object.keys(STATUS_LABELS).find(k => STATUS_LABELS[k] === item.name);
      return COLORS[key!] || "gray";
  });

  return (
    <Card className="bg-card border-border shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-gold">Status dos Leads</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {chartData.length > 0 ? (
          <>
            <DonutChart
              className="mt-6"
              data={chartData}
              category="value"
              index="name"
              colors={finalColors}
              valueFormatter={(number) => `${number} leads`}
            />
            <Legend
              className="mt-3"
              categories={chartData.map((d) => d.name)}
              colors={finalColors}
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
