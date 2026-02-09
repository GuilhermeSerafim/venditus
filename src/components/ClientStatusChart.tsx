import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, Legend } from "@tremor/react";

interface ClientStatusChartProps {
  data: {
    newLeads: number;
    activeClients: number;
    exClients: number;
  };
}

export const ClientStatusChart = ({ data }: ClientStatusChartProps) => {
  const total = data.newLeads + data.activeClients + data.exClients;

  const chartData = [
    { name: "Lead Novo", value: data.newLeads },
    { name: "Cliente Ativo", value: data.activeClients },
    { name: "Ex-Cliente", value: data.exClients },
  ].filter(item => item.value > 0);

  const valueFormatter = (number: number) => {
    const percentage = total > 0 ? ((number / total) * 100).toFixed(1) : "0";
    return `${number} clientes (${percentage}%)`;
  };

  return (
    <Card className="border-border bg-card shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-gold font-bold">Status dos Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <>
            <DonutChart
              className="mt-6 h-80"
              data={chartData}
              category="value"
              index="name"
              colors={["yellow", "emerald", "slate"]}
              valueFormatter={valueFormatter}
              showLabel={true}
              showAnimation={true}
              showTooltip={true}
              variant="donut"
            />
            <Legend
              className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2"
              categories={chartData.map(item => item.name)}
              colors={["yellow", "emerald", "slate"]}
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
