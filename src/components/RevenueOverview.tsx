import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueOverviewProps {
  totalRevenue: number;
  outstandingRevenue: number;
  netRevenue: number;
}

export const RevenueOverview = ({
  totalRevenue,
  outstandingRevenue,
  netRevenue,
}: RevenueOverviewProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-gold">Visão de Receita</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <span className="text-foreground font-medium">Receita Vendida</span>
            <span className="text-2xl font-bold text-gold">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <span className="text-foreground font-medium">Receita em Aberto</span>
            <span className="text-2xl font-bold text-warning">
              {formatCurrency(outstandingRevenue)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gold/20 to-gold-light/20 border border-gold/30">
            <span className="text-foreground font-semibold">Receita Líquida</span>
            <span className="text-3xl font-bold text-gold">
              {formatCurrency(netRevenue)}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ticket Médio</span>
            <span className="text-foreground font-medium">
              {formatCurrency(totalRevenue / Math.max(1, netRevenue > 0 ? 1 : 0))}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de Recebimento</span>
            <span className="text-foreground font-medium">
              {totalRevenue > 0
                ? ((netRevenue / totalRevenue) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
