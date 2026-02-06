import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { LeadSourceChart } from "./LeadSourceChart";
import { EventConversionFunnel } from "./EventConversionFunnel";
import { PaymentMethodsDashboard } from "./PaymentMethodsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, ShoppingCart, TrendingUp, DollarSign, Wallet, BarChart3, Target } from "lucide-react";
import { BarChart, AreaChart } from "@tremor/react";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const ExecutiveDashboard = () => {
  // Fetch all data
  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
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

  const { data: revenues } = useQuery({
    queryKey: ["revenues"],
    queryFn: async () => {
      const { data, error } = await supabase.from("revenues").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Calculate main metrics
  const totalLeads = leads?.length || 0;
  
  const totalSales = sales?.length || 0;
  const totalRevenueSold = sales?.reduce((sum, sale) => sum + Number(sale.sold_value), 0) || 0;
  const totalRevenueNet = sales?.reduce((sum, sale) => sum + Number(sale.net_value), 0) || 0;
  const totalRevenueOutstanding = sales?.reduce((sum, sale) => sum + Number(sale.outstanding_value), 0) || 0;
  const totalExtraRevenue = revenues?.reduce((sum, rev) => sum + Number(rev.amount), 0) || 0;
  
  const averageTicket = totalSales > 0 ? totalRevenueSold / totalSales : 0;

  // Revenue comparison for bar chart
  const revenueComparisonData = [
    { name: "Vendida", value: totalRevenueSold },
    { name: "Líquida", value: totalRevenueNet + totalExtraRevenue },
    { name: "Em Aberto", value: totalRevenueOutstanding },
  ];

  // Monthly revenue evolution for area chart
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const monthlyRevenueData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const salesInMonth = sales?.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate >= monthStart && saleDate <= monthEnd;
    }) || [];

    const revenuesInMonth = revenues?.filter(rev => {
      const revDate = new Date(rev.revenue_date);
      return revDate >= monthStart && revDate <= monthEnd;
    }) || [];

    const netRevenue = salesInMonth.reduce((sum, sale) => sum + Number(sale.net_value), 0);
    const extraRevenue = revenuesInMonth.reduce((sum, rev) => sum + Number(rev.amount), 0);
    
    return {
      date: format(month, "MMM/yy", { locale: ptBR }),
      "Receita Líquida": netRevenue + extraRevenue
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Total de Leads"
          metric={totalLeads.toString()}
          icon={Users}
          color="blue"
        />
        <DashboardMetricCard
          title="Total de Vendas"
          metric={totalSales.toString()}
          icon={ShoppingCart}
          color="purple"
          diff={12} 
          diffType="increase"
          diffText="12% vs mês anterior"
        />
        <DashboardMetricCard
          title="Receita Líquida"
          metric={formatCurrency(totalRevenueNet + totalExtraRevenue)}
          icon={TrendingUp}
          color="emerald"
        />
        <DashboardMetricCard
          title="Receita Total"
          metric={formatCurrency(totalRevenueSold)}
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Receita em Aberto"
          metric={formatCurrency(totalRevenueOutstanding)}
          icon={Wallet}
          color="cyan"
        />
        <DashboardMetricCard
          title="Ticket Médio"
          metric={formatCurrency(averageTicket)}
          icon={BarChart3}
          color="violet"
        />
        <DashboardMetricCard
          title="Receita Vendida"
          metric={formatCurrency(totalRevenueSold)}
          icon={Target}
          color="yellow"
        />
        <DashboardMetricCard
          title="Receita Extra"
          metric={formatCurrency(totalExtraRevenue)}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Charts Section - Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead Source Distribution */}
        <LeadSourceChart />

        {/* Event Conversion Funnel */}
        <EventConversionFunnel />
      </div>

      {/* Payment Methods Dashboard */}
      <PaymentMethodsDashboard />

      {/* Charts Section - Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Comparison Bar Chart */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-gold">Comparativo de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              className="mt-6 h-80"
              data={revenueComparisonData}
              index="name"
              categories={["value"]}
              colors={["amber"]}
              valueFormatter={(number) => formatCurrency(number)}
              yAxisWidth={100}
              showLegend={false}
            />
          </CardContent>
        </Card>

        {/* Monthly Revenue Evolution Area Chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-gold">Evolução da Receita Líquida (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              className="mt-6 h-80"
              data={monthlyRevenueData}
              index="date"
              categories={["Receita Líquida"]}
              colors={["emerald"]}
              valueFormatter={(number) => formatCurrency(number)}
              yAxisWidth={100}
              showLegend={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};