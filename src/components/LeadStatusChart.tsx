import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, Legend } from "@tremor/react";

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
  })).filter(item => item.value > 0);

  const totalLeads = chartData.reduce((sum, item) => sum + item.value, 0);

  const valueFormatter = (number: number) => {
    const percentage = ((number / totalLeads) * 100).toFixed(1);
    return `${number} leads (${percentage}%)`;
  };

  return (
    <Card className="bg-card border-border shadow-xl animate-fade-in hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-gold font-bold">Distribuição de Leads por Status</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <DonutChart
              className="mt-6 h-80"
              data={chartData}
              category="value"
              index="name"
              colors={["yellow", "emerald", "red"]}
              valueFormatter={valueFormatter}
              showLabel={true}
              showAnimation={true}
              showTooltip={true}
              variant="donut"
            />
            <Legend
              className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2"
              categories={chartData.map(item => item.name)}
              colors={["yellow", "emerald", "red"]}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};
