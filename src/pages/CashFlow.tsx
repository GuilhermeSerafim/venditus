import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, TrendingUp, DollarSign, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { AddRevenueDialog } from "@/components/AddRevenueDialog";
import { useRoles } from "@/hooks/useRoles";
import { cn } from "@/lib/utils";

const CashFlow = () => {
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [addRevenueOpen, setAddRevenueOpen] = useState(false);
  const { canEditCashFlow } = useRoles();
  const currentMonth = format(new Date(), "yyyy-MM");

  const { data: sales } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("sale_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: revenues } = useQuery({
    queryKey: ["revenues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenues")
        .select("*")
        .order("revenue_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalSold = sales?.reduce((sum, sale) => sum + Number(sale.sold_value), 0) || 0;
  const totalNet = sales?.reduce((sum, sale) => sum + Number(sale.net_value), 0) || 0;
  const totalOutstanding = sales?.reduce((sum, sale) => sum + Number(sale.outstanding_value), 0) || 0;
  const totalRevenues = revenues?.reduce((sum, rev) => sum + Number(rev.amount), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const combinedRevenue = totalNet + totalRevenues;
  const balance = combinedRevenue - totalExpenses;

  const chartData = [
    { name: "Receita Total", value: combinedRevenue },
    { name: "Despesas", value: totalExpenses },
  ];

  return (
    <AppLayout 
      title="Fluxo de Caixa" 
      description={format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
      actions={
        canEditCashFlow && (
          <div className="flex gap-2">
            <Button
              onClick={() => setAddRevenueOpen(true)}
              className="bg-success hover:bg-success/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
            <Button
              onClick={() => setAddExpenseOpen(true)}
              variant="gold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </div>
        )
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="premium-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receita Líquida</CardTitle>
            <div className="p-2 rounded-lg bg-gold/10 text-gold group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="metric-number text-gold">
              {totalNet.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Valores já recebidos</p>
          </CardContent>
        </Card>

        <Card className="premium-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receitas Extras</CardTitle>
            <div className="p-2 rounded-lg bg-success/10 text-success group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="metric-number text-success">
              {totalRevenues.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">A Receber</CardTitle>
            <div className="p-2 rounded-lg bg-info/10 text-info group-hover:scale-110 transition-transform">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="metric-number text-info">
              {totalOutstanding.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Despesas</CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive group-hover:scale-110 transition-transform">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="metric-number text-destructive">
              {totalExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saldo do Mês</CardTitle>
            <div className={cn(
              "p-2 rounded-lg group-hover:scale-110 transition-transform",
              balance >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("metric-number", balance >= 0 ? "text-success" : "text-destructive")}>
              {balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Receita Total x Despesa</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                formatter={(value: any) => 
                  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                }
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Receitas Extras do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenues?.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell>
                      {format(new Date(revenue.revenue_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{revenue.name}</TableCell>
                    <TableCell>
                      <span className="capitalize">{revenue.category}</span>
                    </TableCell>
                    <TableCell className="text-right text-success font-medium">
                      {Number(revenue.amount).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                {(!revenues || revenues.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma receita registrada neste mês
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Despesas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses?.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.expense_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{expense.name}</TableCell>
                    <TableCell>
                      <span className="capitalize">{expense.type}</span>
                    </TableCell>
                    <TableCell className="text-right text-destructive font-medium">
                      {Number(expense.amount).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                {(!expenses || expenses.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma despesa registrada neste mês
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AddExpenseDialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen} />
      <AddRevenueDialog open={addRevenueOpen} onOpenChange={setAddRevenueOpen} />
    </AppLayout>
  );
};

export default CashFlow;