import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Users, TrendingUp, Package, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Export = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    if (!data || data.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => {
        const value = row[header] || "";
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação concluída",
      description: `Arquivo ${filename}.csv baixado com sucesso.`,
    });
  };

  const handleExport = async (table: string, headers: string[]) => {
    try {
      let query = supabase.from(table as any).select("*");
      
      if (startDate) {
        const dateColumn = table === "leads" ? "created_at" : 
                          table === "sales" ? "sale_date" :
                          table === "events" ? "event_date" : "created_at";
        query = query.gte(dateColumn, startDate);
      }
      
      if (endDate) {
        const dateColumn = table === "leads" ? "created_at" : 
                          table === "sales" ? "sale_date" :
                          table === "events" ? "event_date" : "created_at";
        query = query.lte(dateColumn, endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      exportToCSV(data, table, headers);
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const exportCards = [
    {
      title: "Leads",
      description: "Exportar base completa de leads com todos os campos",
      icon: Users,
      iconBg: "bg-info/10",
      iconColor: "text-info",
      headers: ["id", "name", "company_name", "email", "phone", "status", "notes", "has_partner", "partner_name", "created_at"],
      table: "leads"
    },
    {
      title: "Vendas",
      description: "Exportar histórico de vendas e pagamentos",
      icon: TrendingUp,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      headers: ["id", "sale_date", "sold_value", "net_value", "outstanding_value", "payment_status", "expected_payment_date", "paid_date", "seller_name", "notes"],
      table: "sales"
    },
    {
      title: "Produtos",
      description: "Exportar catálogo de produtos e preços",
      icon: Package,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      headers: ["id", "name", "description", "price", "created_at"],
      table: "products"
    },
    {
      title: "Eventos",
      description: "Exportar eventos e métricas de conversão",
      icon: Calendar,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      headers: ["id", "name", "event_date", "location", "capacity", "leads_count", "confirmed_count", "attended_count", "negotiation_count", "purchased_count"],
      table: "events"
    }
  ];

  return (
    <AppLayout 
      title="Exportar Dados" 
      description="Exporte seus dados em formato CSV"
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Filtro por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {exportCards.map((card) => (
          <Card key={card.table} className="premium-card group">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
              <Button
                onClick={() => handleExport(card.table, card.headers)}
                variant="gold"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar {card.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
};

export default Export;