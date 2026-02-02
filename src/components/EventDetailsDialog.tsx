import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, TrendingUp, DollarSign, FileText } from "lucide-react";

interface EventDetailsDialogProps {
  event: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailsDialog = ({ event, open, onOpenChange }: EventDetailsDialogProps) => {
  const { data: leadEvents } = useQuery({
    queryKey: ["lead-events", event?.id],
    queryFn: async () => {
      if (!event?.id) return [];
      const { data } = await supabase
        .from("lead_events")
        .select("*, leads(name, email, phone)")
        .eq("event_id", event.id);
      return data || [];
    },
    enabled: !!event?.id && open,
  });

  if (!event) return null;

  const totalLeads = leadEvents?.length || 0;
  const conversionRate = event.capacity > 0 ? ((event.purchased_count / event.capacity) * 100).toFixed(1) : "0.0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {event.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <h3 className="font-semibold text-foreground">Informações do Evento</h3>
            </div>
            <div className="pl-6 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium text-foreground">
                    {new Date(event.event_date).toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium text-foreground">{event.location}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Capacidade</p>
                  <p className="font-medium text-foreground">{event.capacity} pessoas</p>
                </div>
              </div>
              {event.cost > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Custo do Evento</p>
                    <p className="font-medium text-gold">
                      R$ {Number(event.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Métricas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <h3 className="font-semibold text-foreground">Métricas de Conversão</h3>
            </div>
            <div className="pl-6 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold text-blue-500">{event.leads_count || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold text-green-500">{event.confirmed_count || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-muted-foreground">Compareceram</p>
                <p className="text-2xl font-bold text-purple-500">{event.attended_count || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-sm text-muted-foreground">Em Negociação</p>
                <p className="text-2xl font-bold text-orange-500">{event.negotiation_count || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-gold/10 border border-gold/20">
                <p className="text-sm text-muted-foreground">Compraram</p>
                <p className="text-2xl font-bold text-gold">{event.purchased_count || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-primary">{conversionRate}%</p>
              </div>
            </div>
          </div>

          {event.notes && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-semibold text-foreground">Observações</h3>
                </div>
                <div className="pl-6">
                  <p className="text-foreground whitespace-pre-wrap">{event.notes}</p>
                </div>
              </div>
            </>
          )}

          {leadEvents && leadEvents.length > 0 && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <h3 className="font-semibold text-foreground">Leads Vinculados ({totalLeads})</h3>
                </div>
                <div className="pl-6 space-y-2 max-h-60 overflow-y-auto">
                  {leadEvents.map((le: any) => (
                    <div key={le.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="font-medium text-foreground">{le.leads?.name}</p>
                      {le.leads?.email && (
                        <p className="text-sm text-muted-foreground">{le.leads.email}</p>
                      )}
                      {le.leads?.phone && (
                        <p className="text-sm text-muted-foreground">{le.leads.phone}</p>
                      )}
                      {le.status && (
                        <p className="text-xs text-muted-foreground mt-1">Status: {le.status}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};