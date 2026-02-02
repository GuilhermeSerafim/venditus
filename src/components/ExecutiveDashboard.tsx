import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModernCard } from "./ModernCard";
import { LeadSourceChart } from "./LeadSourceChart";
import { EventConversionFunnel } from "./EventConversionFunnel";
import { PaymentMethodsDashboard } from "./PaymentMethodsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, UserCheck, ShoppingCart, DollarSign, TrendingUp, Target, Wallet, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
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
    { name: "Vendida", value: totalRevenueSold, fill: "#F2C94C" },
    { name: "Líquida", value: totalRevenueNet + totalExtraRevenue, fill: "#27AE60" },
    { name: "Em Aberto", value: totalRevenueOutstanding, fill: "#3498DB" },
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
      month: format(month, "MMM/yy", { locale: ptBR }),
      value: netRevenue + extraRevenue
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
        <ModernCard
          title="Total de Leads"
          value={totalLeads}
          icon={Users}
          description="Cadastrados no sistema"
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <ModernCard
          title="Total de Vendas"
          value={totalSales}
          icon={ShoppingCart}
          description={`${averageTicket.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} ticket médio`}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
        />
        <ModernCard
          title="Receita Líquida"
          value={formatCurrency(totalRevenueNet + totalExtraRevenue)}
          icon={TrendingUp}
          iconColor="text-green-500"
          iconBgColor="bg-green-500/10"
        />
        <ModernCard
          title="Receita Total"
          value={formatCurrency(totalRevenueSold)}
          icon={DollarSign}
          description={`${formatCurrency(totalRevenueNet + totalExtraRevenue)} líquida`}
          iconColor="text-gold"
          iconBgColor="bg-gold/10"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModernCard
          title="Receita em Aberto"
          value={formatCurrency(totalRevenueOutstanding)}
          icon={Wallet}
          description="A receber"
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <ModernCard
          title="Ticket Médio"
          value={formatCurrency(averageTicket)}
          icon={BarChart3}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
        />
        <ModernCard
          title="Receita Vendida"
          value={formatCurrency(totalRevenueSold)}
          icon={Target}
          iconColor="text-gold"
          iconBgColor="bg-gold/10"
        />
        <ModernCard
          title="Receita Extra"
          value={formatCurrency(totalExtraRevenue)}
          icon={DollarSign}
          description="Receitas adicionais"
          iconColor="text-green-500"
          iconBgColor="bg-green-500/10"
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueComparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Evolution Area Chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-gold">Evolução da Receita Líquida (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#27AE60" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#27AE60" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#27AE60" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};