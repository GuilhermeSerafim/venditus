import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { LeadSourceChart } from "./LeadSourceChart";
import { EventConversionFunnel } from "./EventConversionFunnel";
import { PaymentMethodsDashboard } from "./PaymentMethodsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, ShoppingCart, TrendingUp, DollarSign, Wallet, BarChart3, Target, Calendar } from "lucide-react";
import { 
  BarChart, 
  AreaChart, 
  DateRangePicker, 
  DateRangePickerValue, 
  Table, 
  TableHead, 
  TableHeaderCell, 
  TableBody, 
  TableRow, 
  TableCell, 
  Badge,
  ProgressBar,
  Text,
  Flex
} from "@tremor/react";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppRole, ROLE_LABELS } from "@/hooks/useRoles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ExecutiveDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [selectedRole, setSelectedRole] = useState<AppRole | "all">("all");

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
      const { data, error } = await supabase.from("sales").select("*, products(name), leads(name)");
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

  const { data: userRoles = [] } = useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Filter Logic
  const filterByDate = (dateStr: string) => {
    if (!dateRange.from || !dateRange.to) return true;
    const date = new Date(dateStr);
    return isWithinInterval(date, { 
      start: startOfDay(dateRange.from), 
      end: endOfDay(dateRange.to) 
    });
  };

  const allowedUserIds = useMemo(() => {
    if (selectedRole === "all") return null;
    return userRoles
      .filter((ur) => ur.role === selectedRole)
      .map((ur) => ur.user_id);
  }, [selectedRole, userRoles]);

  const filterByRole = (itemUserId: string) => {
    if (!allowedUserIds) return true;
    return allowedUserIds.includes(itemUserId);
  };

  const filteredLeads = leads?.filter(l => filterByDate(l.created_at) && filterByRole(l.user_id)) || [];
  const filteredSales = sales?.filter(s => filterByDate(s.sale_date) && filterByRole(s.user_id)) || [];
  const filteredRevenues = revenues?.filter(r => filterByDate(r.revenue_date) && filterByRole(r.user_id)) || [];

  // Calculate main metrics (Filtered)
  const totalLeads = filteredLeads.length;
  
  const totalSales = filteredSales.length;
  const totalRevenueSold = filteredSales.reduce((sum, sale) => sum + Number(sale.sold_value), 0);
  const totalRevenueNet = filteredSales.reduce((sum, sale) => sum + Number(sale.net_value), 0);
  const totalRevenueOutstanding = filteredSales.reduce((sum, sale) => sum + Number(sale.outstanding_value), 0);
  const totalExtraRevenue = filteredRevenues.reduce((sum, rev) => sum + Number(rev.amount), 0);
  
  const averageTicket = totalSales > 0 ? totalRevenueSold / totalSales : 0;

  // Revenue comparison for bar chart (Filtered)
  const revenueComparisonData = [
    { name: "Vendida", value: totalRevenueSold },
    { name: "Líquida", value: totalRevenueNet + totalExtraRevenue },
    { name: "Em Aberto", value: totalRevenueOutstanding },
  ];

  // Monthly revenue evolution (Global context - specific logic)
  // Logic: If filter is largely historic, show evolution within that range. 
  // For simplicity in this iteration, we keep the "Last 6 Months" chart static as a trend indicator, 
  // unless we want to make it dynamic based on the filter range interval. 
  // Let's make it respect the filter if possible, or default to last 6 months if no specific range or very small range.
  // Currently sticking to "Last 6 Months" for the trend chart as it's often useful context regardless of the specific filtered "Today/Yesterday" view.
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const monthlyRevenueData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // Using global sales/revenues for the trend chart to ensure context
    const salesInMonth = sales?.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate >= monthStart && saleDate <= monthEnd && filterByRole(sale.user_id);
    }) || [];

    const revenuesInMonth = revenues?.filter(rev => {
      const revDate = new Date(rev.revenue_date);
      return revDate >= monthStart && revDate <= monthEnd && filterByRole(rev.user_id);
    }) || [];

    const netRevenue = salesInMonth.reduce((sum, sale) => sum + Number(sale.net_value), 0);
    const extraRevenue = revenuesInMonth.reduce((sum, rev) => sum + Number(rev.amount), 0);
    
    return {
      date: format(month, "MMM/yy", { locale: ptBR }),
      "Receita Líquida": netRevenue + extraRevenue
    };
  });

  // Goal Tracker Logic
  const monthlyGoal = 50000; // Static Goal for now
  const currentMonthSales = sales?.filter(s => {
    const date = new Date(s.sale_date);
    return date >= startOfMonth(new Date()) && date <= endOfMonth(new Date()) && filterByRole(s.user_id);
  }) || [];
  const currentMonthRevenue = currentMonthSales.reduce((sum, s) => sum + Number(s.sold_value), 0);
  const goalProgress = Math.min((currentMonthRevenue / monthlyGoal) * 100, 100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  // Recent Sales Table Data
  const recentSales = [...(sales || [])]
    .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
    .slice(0, 5); // Take top 5

  return (
    <div className="space-y-6">
      {/* Filter only - Title removed to avoid duplication */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto relative">
          <DateRangePicker 
            className="w-full max-w-sm sm:max-w-xs"
            value={dateRange}
            onValueChange={setDateRange}
            selectPlaceholder="Selecione o período"
            color="yellow"
            locale={ptBR}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as AppRole | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as funções</SelectItem>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Goal Tracker */}
      <Card className="border-border bg-gradient-to-br from-card to-card/80 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="pt-6">
          <Flex>
            <Text className="truncate font-semibold">Meta Mensal (Mês Atual)</Text>
            <Text className="font-bold">{formatCurrency(currentMonthRevenue)} / {formatCurrency(monthlyGoal)}</Text>
          </Flex>
          <ProgressBar 
            value={goalProgress} 
            color="yellow" 
            className="mt-3 h-3 transition-all duration-500 ease-out" 
          />
        </CardContent>
      </Card>

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
          diff={12} // Placeholder for now
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
        {/* Lead Source Distribution - We can pass filter props later if needed */}
        <LeadSourceChart />

        {/* Event Conversion Funnel */}
        <EventConversionFunnel />
      </div>

      {/* Payment Methods Dashboard */}
      {/* Note: PaymentMethodsDashboard has its own internal filter logic currently. 
          Ideally we should lift that state up or pass the dateRange prop, but for this iteration
          we keep it independent to avoid breaking changes, or we can refactor it now.
          Let's keep it independent as it has specific logic.
      */}
      <PaymentMethodsDashboard />

      {/* Charts Section - Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Comparison Bar Chart */}
        <Card className="border-border bg-card shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-gold font-bold">Comparativo de Receita (Período Selecionado)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              className="mt-6 h-80"
              data={revenueComparisonData}
              index="name"
              categories={["value"]}
              colors={["amber"]}
              valueFormatter={(number) => formatCurrency(number)}
              yAxisWidth={120}
              showLegend={false}
              showGridLines={false}
              showAnimation={true}
              animationDuration={800}
            />
          </CardContent>
        </Card>

        {/* Monthly Evolution Area Chart */}
        <Card className="border-border bg-card shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-gold font-bold">Evolução Mensal (Últimos 6 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              className="mt-6 h-80"
              data={monthlyRevenueData}
              index="date"
              categories={["Receita Líquida"]}
              colors={["blue"]}
              valueFormatter={(number) => formatCurrency(number)}
              showLegend={false}
              showGridLines={false}
              showAnimation={true}
              animationDuration={800}
              curveType="natural"
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card className="border-border bg-gradient-to-br from-card to-card/80 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-gold font-bold">Vendas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Cliente</TableHeaderCell>
                <TableHeaderCell>Produto</TableHeaderCell>
                <TableHeaderCell>Valor</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Data</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.leads?.name || "Cliente Desconhecido"}</TableCell>
                  <TableCell>
                    <Text>{sale.products?.name || "Produto"}</Text>
                  </TableCell>
                  <TableCell>{formatCurrency(Number(sale.sold_value))}</TableCell>
                  <TableCell>
                    <Badge color={sale.payment_status === 'paid' ? 'emerald' : 'amber'}>
                      {sale.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {format(new Date(sale.sale_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};