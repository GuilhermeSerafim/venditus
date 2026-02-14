import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMesaNegocios } from "@/hooks/useMesaNegocios";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface AddDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddDealDialog = ({ open, onOpenChange }: AddDealDialogProps) => {
  const { createDeal } = useMesaNegocios();
  const { user } = useAuth();
  const { data: members = [] } = useOrganizationMembers();

  const [empresa, setEmpresa] = useState("");
  const [dataReuniao, setDataReuniao] = useState("");
  const [valorNegocio, setValorNegocio] = useState("");
  const [notas, setNotas] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get organization ID
  const { data: orgId } = useQuery({
    queryKey: ["organization_id"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_auth_organization_id");
      return data as string;
    },
    enabled: !!user,
  });

  const handleSubmit = async () => {
    if (!empresa || !dataReuniao || !user || !orgId) return;

    setIsSubmitting(true);
    try {
      await createDeal.mutateAsync({
        organization_id: orgId,
        responsavel_id: responsavelId || user.id,
        lead_id: null,
        empresa,
        data_reuniao: new Date(dataReuniao).toISOString(),
        compareceu: false,
        pix_compromisso: false,
        situacao: "NEGOCIANDO",
        motivo_perda: null,
        valor_negocio: Number(valorNegocio) || 0,
        notas: notas || null,
      });

      // Reset form
      setEmpresa("");
      setDataReuniao("");
      setValorNegocio("");
      setNotas("");
      setResponsavelId("");
      onOpenChange(false);
    } catch {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Reunião</DialogTitle>
          <DialogDescription>
            Agende uma nova reunião de negócios. Você ganhará +20 pontos!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="empresa">Empresa *</Label>
            <Input
              id="empresa"
              placeholder="Nome da empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
          </div>

          <div>
            <Label>Responsável</Label>
            <Select value={responsavelId} onValueChange={setResponsavelId}>
              <SelectTrigger>
                <SelectValue placeholder="Eu mesmo (padrão)" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name || m.email.split("@")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_reuniao">Data da Reunião *</Label>
            <Input
              id="data_reuniao"
              type="datetime-local"
              value={dataReuniao}
              onChange={(e) => setDataReuniao(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="valor">Valor do Negócio (R$)</Label>
            <Input
              id="valor"
              type="number"
              placeholder="0,00"
              min="0"
              step="0.01"
              value={valorNegocio}
              onChange={(e) => setValorNegocio(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notas">Observações</Label>
            <Textarea
              id="notas"
              placeholder="Detalhes sobre a reunião..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!empresa || !dataReuniao || isSubmitting}
              className="bg-gold hover:bg-gold/90 text-primary-foreground"
            >
              {isSubmitting ? "Criando..." : "Agendar Reunião"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
