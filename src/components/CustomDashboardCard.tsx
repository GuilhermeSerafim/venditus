import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Edit, Copy } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

interface CustomDashboardCardProps {
  dashboard: {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    color: string;
    data_source: string;
    fields: any;
    formula: string;
    visualization_type: string;
  };
  onDelete: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
}

export const CustomDashboardCard = ({ dashboard, onDelete, onEdit, onDuplicate }: CustomDashboardCardProps) => {
  const IconComponent = (LucideIcons as any)[dashboard.icon] || LucideIcons.BarChart3;

  // Fetch data based on data source
  const { data: sourceData } = useQuery({
    queryKey: [dashboard.data_source, dashboard.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(dashboard.data_source as any)
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Calculate metric based on formula
  const calculateMetric = () => {
    if (!sourceData || sourceData.length === 0) return "0";

    switch (dashboard.formula) {
      case "count":
        return sourceData.length.toString();
      case "sum":
        // Assume we're summing a numeric field (needs more sophisticated logic)
        return sourceData.length.toString();
      case "avg":
        return sourceData.length.toString();
      case "percentage":
        return "100%";
      default:
        return sourceData.length.toString();
    }
  };

  const renderVisualization = () => {
    if (!sourceData || sourceData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          Sem dados disponíveis
        </div>
      );
    }

    switch (dashboard.visualization_type) {
      case "kpi":
        return (
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <div className="text-5xl font-bold" style={{ color: dashboard.color }}>
                {calculateMetric()}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {dashboard.name}
              </div>
            </div>
          </div>
        );

      case "pie":
        const pieData = [
          { name: "Dados", value: sourceData.length },
        ];
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill={dashboard.color}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={dashboard.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case "bar":
        const barData = [
          { name: dashboard.name, value: sourceData.length },
        ];
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={dashboard.color} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        const lineData = [
          { name: dashboard.name, value: sourceData.length },
        ];
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={dashboard.color} />
            </LineChart>
          </ResponsiveContainer>
        );

      case "table":
        return (
          <div className="overflow-auto max-h-[200px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">{calculateMetric()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-all">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div 
            className="p-2 rounded-lg" 
            style={{ backgroundColor: `${dashboard.color}20` }}
          >
            <IconComponent className="h-5 w-5" style={{ color: dashboard.color }} />
          </div>
          <div>
            <CardTitle className="text-base">{dashboard.name}</CardTitle>
            {dashboard.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.description}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {renderVisualization()}
      </CardContent>
    </Card>
  );
};
