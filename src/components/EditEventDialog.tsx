import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EditEventDialogProps {
  event: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditEventDialog = ({ event, open, onOpenChange }: EditEventDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: event.name || "",
      event_date: event.event_date || "",
      location: event.location || "",
      capacity: event.capacity || "",
      leads_count: event.leads_count || 0,
      confirmed_count: event.confirmed_count || 0,
      attended_count: event.attended_count || 0,
      negotiation_count: event.negotiation_count || 0,
      purchased_count: event.purchased_count || 0,
      cost: event.cost || 0,
      notes: event.notes || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from("events")
        .update(values)
        .eq("id", event.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Evento atualizado com sucesso" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar evento", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-gold">Editar Evento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="leads_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leads Gerados</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmed_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmados</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="attended_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compareceram</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="negotiation_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Negociação</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchased_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compraram</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo do Evento (R$)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Observações sobre o evento" className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-gold text-black hover:bg-gold/90">
              Salvar Alterações
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
