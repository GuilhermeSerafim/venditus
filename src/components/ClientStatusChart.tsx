import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ClientStatusChartProps {
  data: {
    newLeads: number;
    activeClients: number;
    exClients: number;
  };
}

const COLORS = {
  newLeads: "#F2C94C", // Amarelo/Dourado
  activeClients: "#27AE60", // Verde
  exClients: "#95A5A6", // Cinza
};

export const ClientStatusChart = ({ data }: ClientStatusChartProps) => {
  const total = data.newLeads + data.activeClients + data.exClients;

  const chartData = [
    { name: "Lead Novo", value: data.newLeads, percentage: total > 0 ? ((data.newLeads / total) * 100).toFixed(1) : 0 },
    { name: "Cliente Ativo", value: data.activeClients, percentage: total > 0 ? ((data.activeClients / total) * 100).toFixed(1) : 0 },
    { name: "Ex-Cliente", value: data.exClients, percentage: total > 0 ? ((data.exClients / total) * 100).toFixed(1) : 0 },
  ].filter(item => item.value > 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-gold">Status dos Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.name === "Lead Novo" ? COLORS.newLeads :
                    entry.name === "Cliente Ativo" ? COLORS.activeClients :
                    COLORS.exClients
                  } 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => `${value} clientes`}
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
