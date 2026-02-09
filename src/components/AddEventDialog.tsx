import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddEventDialog = ({ open, onOpenChange }: AddEventDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: org } = useOrganization();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const eventData = {
      name: formData.get("name") as string,
      event_date: formData.get("event_date") as string,
      location: formData.get("location") as string,
      capacity: parseInt(formData.get("capacity") as string) || 0,
      leads_count: parseInt(formData.get("leads_count") as string) || 0,
      confirmed_count: parseInt(formData.get("confirmed_count") as string) || 0,
      attended_count: parseInt(formData.get("attended_count") as string) || 0,
      negotiation_count: parseInt(formData.get("negotiation_count") as string) || 0,
      purchased_count: parseInt(formData.get("purchased_count") as string) || 0,
      notes: formData.get("notes") as string,
      organization_id: org?.id,
    };

    try {
      const { error } = await supabase.from("events").insert([eventData]);
      
      if (error) throw error;

      toast({
        title: "Evento cadastrado",
        description: "Evento adicionado com sucesso ao sistema.",
      });

      queryClient.invalidateQueries({ queryKey: ["events"] });
      onOpenChange(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o evento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-gold">Cadastrar Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Evento *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Ex: Seven Night #14"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_date">Data *</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                required
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                name="location"
                placeholder="Ex: São Paulo - SP"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                defaultValue="0"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Dados do Funil (Opcional)
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="leads_count">Leads</Label>
                <Input
                  id="leads_count"
                  name="leads_count"
                  type="number"
                  defaultValue="0"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmed_count">Confirmados</Label>
                <Input
                  id="confirmed_count"
                  name="confirmed_count"
                  type="number"
                  defaultValue="0"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attended_count">Compareceram</Label>
                <Input
                  id="attended_count"
                  name="attended_count"
                  type="number"
                  defaultValue="0"
                  className="bg-secondary border-border"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="space-y-2">
                <Label htmlFor="negotiation_count">Negociação</Label>
                <Input
                  id="negotiation_count"
                  name="negotiation_count"
                  type="number"
                  defaultValue="0"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchased_count">Compraram</Label>
                <Input
                  id="purchased_count"
                  name="purchased_count"
                  type="number"
                  defaultValue="0"
                  className="bg-secondary border-border"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              name="notes"
              placeholder="Observações sobre o evento"
              className="bg-secondary border-border"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gold text-primary-foreground hover:bg-gold-dark"
            >
              {loading ? "Cadastrando..." : "Cadastrar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
