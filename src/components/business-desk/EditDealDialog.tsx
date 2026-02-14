import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useMesaNegocios } from "@/hooks/useMesaNegocios";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import type { MesaNegocios, SituacaoNegocio } from "@/types/social-selling";
import { format } from "date-fns";

interface EditDealDialogProps {
  deal: MesaNegocios & { profiles?: any; leads?: any };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditDealDialog = ({ deal, open, onOpenChange }: EditDealDialogProps) => {
  const { updateDeal } = useMesaNegocios();
  const { data: members = [] } = useOrganizationMembers();

  const [empresa, setEmpresa] = useState(deal.empresa);
  const [dataReuniao, setDataReuniao] = useState<Date | undefined>(
    deal.data_reuniao ? new Date(deal.data_reuniao) : undefined
  );
  const [valorNegocio, setValorNegocio] = useState(String(deal.valor_negocio || ""));
  const [situacao, setSituacao] = useState<SituacaoNegocio>(deal.situacao);
  const [compareceu, setCompareceu] = useState(deal.compareceu);
  const [pixCompromisso, setPixCompromisso] = useState(deal.pix_compromisso);
  const [motivoPerda, setMotivoPerda] = useState(deal.motivo_perda || "");
  const [notas, setNotas] = useState(deal.notas || "");
  const [responsavelId, setResponsavelId] = useState(deal.responsavel_id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmpresa(deal.empresa);
    setDataReuniao(deal.data_reuniao ? new Date(deal.data_reuniao) : undefined);
    setValorNegocio(String(deal.valor_negocio || ""));
    setSituacao(deal.situacao);
    setCompareceu(deal.compareceu);
    setPixCompromisso(deal.pix_compromisso);
    setMotivoPerda(deal.motivo_perda || "");
    setNotas(deal.notas || "");
    setResponsavelId(deal.responsavel_id);
  }, [deal]);

  const handleSubmit = async () => {
    if (!empresa || !dataReuniao) return;

    setIsSubmitting(true);
    try {
      await updateDeal.mutateAsync({
        id: deal.id,
        empresa,
        data_reuniao: dataReuniao.toISOString(),
        valor_negocio: Number(valorNegocio) || 0,
        situacao,
        compareceu,
        pix_compromisso: pixCompromisso,
        motivo_perda: situacao === "PERDIDO" ? motivoPerda || null : null,
        notas: notas || null,
        responsavel_id: responsavelId,
      });
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
          <DialogTitle>Editar Negócio</DialogTitle>
          <DialogDescription>
            Atualize os dados da reunião de negócios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <Label htmlFor="edit-empresa">Empresa *</Label>
            <Input
              id="edit-empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
          </div>

          <div>
            <Label>Responsável</Label>
            <Select value={responsavelId} onValueChange={setResponsavelId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.name || m.email.split("@")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Data da Reunião *</Label>
            <div className="pt-1">
              <DateTimePicker date={dataReuniao} setDate={setDataReuniao} />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-valor">Valor do Negócio (R$)</Label>
            <Input
              id="edit-valor"
              type="number"
              min="0"
              step="0.01"
              value={valorNegocio}
              onChange={(e) => setValorNegocio(e.target.value)}
            />
          </div>

          <div>
            <Label>Situação</Label>
            <Select value={situacao} onValueChange={(val) => setSituacao(val as SituacaoNegocio)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEGOCIANDO">🤝 Negociando</SelectItem>
                <SelectItem value="GANHO">🏆 Ganho (+100 pts)</SelectItem>
                <SelectItem value="PERDIDO">❌ Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {situacao === "PERDIDO" && (
            <div>
              <Label htmlFor="edit-motivo">Motivo da Perda</Label>
              <Input
                id="edit-motivo"
                placeholder="Por que o negócio foi perdido?"
                value={motivoPerda}
                onChange={(e) => setMotivoPerda(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-compareceu" className="cursor-pointer">
              Compareceu à reunião (+30 pts)
            </Label>
            <Switch
              id="edit-compareceu"
              checked={compareceu}
              onCheckedChange={setCompareceu}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-pix" className="cursor-pointer">
              PIX Compromisso
            </Label>
            <Switch
              id="edit-pix"
              checked={pixCompromisso}
              onCheckedChange={setPixCompromisso}
            />
          </div>

          <div>
            <Label htmlFor="edit-notas">Observações</Label>
            <Textarea
              id="edit-notas"
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
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
