import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CashFlowModule = () => {
  const { data: sales } = useQuery({
    queryKey: ["sales-cashflow"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, leads(name), products(name)")
        .order("expected_payment_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const totalSold = sales?.reduce((sum, sale) => sum + Number(sale.sold_value), 0) || 0;
  const totalReceived = sales?.reduce((sum, sale) => sum + Number(sale.net_value), 0) || 0;
  const totalOutstanding = sales?.reduce((sum, sale) => sum + Number(sale.outstanding_value), 0) || 0;

  // Group by month
  const salesByMonth = sales?.reduce((acc: any, sale) => {
    const month = sale.expected_payment_date 
      ? new Date(sale.expected_payment_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : 'Sem previsão';
    
    if (!acc[month]) {
      acc[month] = {
        expected: 0,
        received: 0,
        sales: []
      };
    }
    
    acc[month].expected += Number(sale.outstanding_value);
    acc[month].received += Number(sale.net_value);
    acc[month].sales.push(sale);
    
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-card hover:shadow-[var(--shadow-gold)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vendido</CardTitle>
            <DollarSign className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">
              R$ {(totalSold / 1000).toFixed(0)}k
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-[var(--shadow-gold)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Líquido Recebido</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              R$ {(totalReceived / 1000).toFixed(0)}k
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-[var(--shadow-gold)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber</CardTitle>
            <Clock className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold">
              R$ {(totalOutstanding / 1000).toFixed(0)}k
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Projeção de Recebíveis por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {Object.entries(salesByMonth || {}).map(([month, data]: [string, any]) => (
                <Card key={month} className="border-border bg-background">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="capitalize">{month}</span>
                      <Badge className="bg-gold/10 text-gold">
                        {data.sales.length} vendas
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <span className="text-sm text-muted-foreground">Já Recebido</span>
                      <span className="text-lg font-bold text-green-500">
                        R$ {(data.received / 1000).toFixed(1)}k
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gold/5 border border-gold/20">
                      <span className="text-sm text-muted-foreground">Previsto</span>
                      <span className="text-lg font-bold text-gold">
                        R$ {(data.expected / 1000).toFixed(1)}k
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {data.sales.map((sale: any) => (
                        <div key={sale.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-muted/50">
                          <div>
                            <span className="font-medium">{sale.leads?.name}</span>
                            <span className="text-muted-foreground"> - {sale.products?.name}</span>
                          </div>
                          <Badge className={sale.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-gold/10 text-gold'}>
                            R$ {Number(sale.outstanding_value).toLocaleString()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
