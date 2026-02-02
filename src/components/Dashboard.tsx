import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "./MetricCard";
import { ClientStatusChart } from "./ClientStatusChart";
import { RevenueOverview } from "./RevenueOverview";
import { Users, UserCheck, TrendingUp, DollarSign } from "lucide-react";

export const Dashboard = () => {
  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: sales } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Calculate metrics with new status
  const totalLeads = leads?.length || 0;
  const newLeads = leads?.filter((l) => l.status === "lead").length || 0;
  const activeClients = leads?.filter((l) => l.status === "cliente_ativo").length || 0;
  const exClients = leads?.filter((l) => l.status === "ex_cliente").length || 0;
  
  const activeClientRate = totalLeads > 0 ? (activeClients / totalLeads) * 100 : 0;

  const totalRevenue = sales?.reduce((sum, sale) => sum + (Number(sale.sold_value) || 0), 0) || 0;
  const outstandingRevenue = sales?.reduce((sum, sale) => sum + (Number(sale.outstanding_value) || 0), 0) || 0;
  const netRevenue = sales?.reduce((sum, sale) => sum + (Number(sale.net_value) || 0), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Contatos"
          value={totalLeads.toString()}
          icon={<Users className="h-5 w-5" />}
          trend={`${newLeads} leads novos`}
        />
        <MetricCard
          title="Clientes Ativos"
          value={activeClients.toString()}
          icon={<UserCheck className="h-5 w-5" />}
          trend={`${activeClientRate.toFixed(1)}% do total`}
        />
        <MetricCard
          title="Ex-Clientes"
          value={exClients.toString()}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="Reativação possível"
        />
        <MetricCard
          title="Receita Total"
          value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={`R$ ${(netRevenue / 1000).toFixed(0)}k líquido`}
        />
      </div>

      {/* Status Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ClientStatusChart
          data={{
            newLeads,
            activeClients,
            exClients,
          }}
        />
        <RevenueOverview
          totalRevenue={totalRevenue}
          outstandingRevenue={outstandingRevenue}
          netRevenue={netRevenue}
        />
      </div>
    </div>
  );
};
