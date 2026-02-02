import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, DollarSign, Package } from "lucide-react";
import { InteractionsTimeline } from "./InteractionsTimeline";
import { AddInteractionForm } from "./AddInteractionForm";
import { useRoles } from "@/hooks/useRoles";

interface LeadDetailsDialogProps {
  lead: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadDetailsDialog = ({ lead, open, onOpenChange }: LeadDetailsDialogProps) => {
  const { canEditLeads } = useRoles();
  
  const { data: sales } = useQuery({
    queryKey: ["lead-sales", lead.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, products(*)")
        .eq("lead_id", lead.id)
        .order("sale_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["lead-events", lead.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_events")
        .select("*, events(*)")
        .eq("lead_id", lead.id)
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: interactions } = useQuery({
    queryKey: ["lead-interactions", lead.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interactions")
        .select("*")
        .eq("lead_id", lead.id)
        .order("interaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalSales = sales?.reduce((sum, sale) => sum + Number(sale.sold_value), 0) || 0;
  const totalOutstanding = sales?.reduce((sum, sale) => sum + Number(sale.outstanding_value), 0) || 0;

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      pix: "Pix",
      boleto: "Boleto",
      cartao_credito: "Cartão de Crédito",
      transferencia: "Transferência",
      dinheiro: "Dinheiro",
      parcelado: "Parcelado",
    };
    return labels[method] || method;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-gold text-2xl">{lead.name}</DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge>{lead.email}</Badge>
            <Badge>{lead.phone}</Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-background">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="interactions">Interações</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="overview" className="space-y-4">
              {/* Informações Completas do Lead */}
              <Card className="border-border bg-background">
                <CardHeader>
                  <CardTitle className="text-sm">Informações do Lead</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Nome Completo</span>
                      <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    </div>
                    {lead.company_name && (
                      <div>
                        <span className="text-xs text-muted-foreground">Nome da Empresa</span>
                        <p className="text-sm font-medium text-foreground">{lead.company_name}</p>
                      </div>
                    )}
                    {lead.cpf && (
                      <div>
                        <span className="text-xs text-muted-foreground">CPF</span>
                        <p className="text-sm font-medium text-foreground">{lead.cpf}</p>
                      </div>
                    )}
                    {lead.cnpj && (
                      <div>
                        <span className="text-xs text-muted-foreground">CNPJ</span>
                        <p className="text-sm font-medium text-foreground">{lead.cnpj}</p>
                      </div>
                    )}
                    {lead.email && (
                      <div>
                        <span className="text-xs text-muted-foreground">E-mail</span>
                        <p className="text-sm font-medium text-foreground">{lead.email}</p>
                      </div>
                    )}
                    {lead.phone && (
                      <div>
                        <span className="text-xs text-muted-foreground">Telefone</span>
                        <p className="text-sm font-medium text-foreground">{lead.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-muted-foreground">Origem</span>
                      <p className="text-sm font-medium text-foreground">{lead.lead_source}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Tem Sócio?</span>
                      <p className="text-sm font-medium text-foreground">{lead.has_partner ? "Sim" : "Não"}</p>
                    </div>
                    {lead.has_partner && lead.partner_name && (
                      <div className="col-span-2">
                        <span className="text-xs text-muted-foreground">Nome do Sócio</span>
                        <p className="text-sm font-medium text-foreground">{lead.partner_name}</p>
                      </div>
                    )}
                  </div>
                  {lead.notes && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Observações</span>
                      <p className="text-sm text-foreground mt-1">{lead.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Métricas de Vendas */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border bg-background">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Vendido</CardTitle>
                    <DollarSign className="h-4 w-4 text-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gold">
                      R$ {(totalSales / 1000).toFixed(1)}k
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-background">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Em Aberto</CardTitle>
                    <DollarSign className="h-4 w-4 text-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gold">
                      R$ {(totalOutstanding / 1000).toFixed(1)}k
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-background">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Vendas</CardTitle>
                    <Package className="h-4 w-4 text-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gold">{sales?.length || 0}</div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-background">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Eventos</CardTitle>
                    <Calendar className="h-4 w-4 text-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gold">{events?.length || 0}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              {sales?.map((sale) => (
                <Card key={sale.id} className="border-border bg-background">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{sale.products?.name}</span>
                      <Badge className={sale.payment_status === "paid" ? "bg-green-500/10 text-green-500" : "bg-gold/10 text-gold"}>
                        {sale.payment_status === "paid" ? "Pago" : "Pendente"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor Vendido:</span>
                      <span className="text-gold font-medium">R$ {Number(sale.sold_value).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Em Aberto:</span>
                      <span className="text-gold font-medium">R$ {Number(sale.outstanding_value).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Líquido:</span>
                      <span className="text-green-500 font-medium">R$ {Number(sale.net_value).toLocaleString()}</span>
                    </div>
                    {sale.payment_method && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Forma de Pagamento:</span>
                        <span>{getPaymentMethodLabel(sale.payment_method)}</span>
                      </div>
                    )}
                    {sale.seller_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Vendedor:</span>
                        <span>{sale.seller_name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {!sales?.length && (
                <p className="text-center text-muted-foreground py-8">Nenhuma venda registrada</p>
              )}
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {events?.map((event) => (
                <Card key={event.id} className="border-border bg-background">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{event.events?.name}</span>
                      <Badge>{event.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data:</span>
                      <span>{new Date(event.events?.event_date).toLocaleDateString()}</span>
                    </div>
                    {event.events?.location && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Local:</span>
                        <span>{event.events.location}</span>
                      </div>
                    )}
                    {event.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{event.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {!events?.length && (
                <p className="text-center text-muted-foreground py-8">Nenhum evento registrado</p>
              )}
            </TabsContent>

            <TabsContent value="interactions" className="space-y-4">
              {canEditLeads && <AddInteractionForm leadId={lead.id} />}
              <InteractionsTimeline interactions={interactions || []} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};