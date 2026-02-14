import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Separator } from "@/components/ui/separator";
import { useMesaNegocios } from "@/hooks/useMesaNegocios";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import type { SituacaoNegocio } from "@/types/social-selling";
import type { DealWithRelations } from "./BusinessCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Building2, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DealSheetProps {
  deal: DealWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DealSheet = ({ deal, open, onOpenChange }: DealSheetProps) => {
  const { updateDeal, deleteDeal } = useMesaNegocios();
  const { data: members = [] } = useOrganizationMembers();

  const [empresa, setEmpresa] = useState("");
  const [dataReuniao, setDataReuniao] = useState<Date | undefined>();
  const [valorNegocio, setValorNegocio] = useState("");
  const [situacao, setSituacao] = useState<SituacaoNegocio>("NEGOCIANDO");
  const [compareceu, setCompareceu] = useState(false);
  const [pixCompromisso, setPixCompromisso] = useState(false);
  const [motivoPerda, setMotivoPerda] = useState("");
  const [notas, setNotas] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (deal) {
      setEmpresa(deal.empresa);
      setDataReuniao(deal.data_reuniao ? new Date(deal.data_reuniao) : undefined);
      setValorNegocio(String(deal.valor_negocio || ""));
      setSituacao(deal.situacao);
      setCompareceu(deal.compareceu);
      setPixCompromisso(deal.pix_compromisso);
      setMotivoPerda(deal.motivo_perda || "");
      setNotas(deal.notas || "");
      setResponsavelId(deal.responsavel_id);
    }
  }, [deal]);

  const handleSave = async () => {
    if (!deal || !empresa || !dataReuniao) return;

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
      // Handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (deal) {
      deleteDeal.mutate(deal.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    }
  };

  if (!deal) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto p-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-6 py-4">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-4 w-4 text-primary" />
                {deal.empresa}
              </SheetTitle>
              <SheetDescription className="text-xs">
                Criado em {format(new Date(deal.created_at), "dd MMM yyyy", { locale: ptBR })}
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* Form */}
          <div className="px-6 py-5 space-y-5">
            {/* Empresa */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Empresa
              </Label>
              <Input
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="border-border/50 focus:border-primary/50"
              />
            </div>

            {/* Responsável */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Responsável
              </Label>
              <Select value={responsavelId} onValueChange={setResponsavelId}>
                <SelectTrigger className="border-border/50">
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

            {/* Data */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Data da Reunião
              </Label>
              <DateTimePicker date={dataReuniao} setDate={setDataReuniao} />
            </div>

            {/* Valor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Valor do Negócio (R$)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={valorNegocio}
                onChange={(e) => setValorNegocio(e.target.value)}
                className="border-border/50 focus:border-primary/50"
              />
            </div>

            <Separator className="my-2" />

            {/* Situação */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Situação
              </Label>
              <Select value={situacao} onValueChange={(v) => setSituacao(v as SituacaoNegocio)}>
                <SelectTrigger className="border-border/50">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Motivo da Perda
                </Label>
                <Input
                  placeholder="Por que o negócio foi perdido?"
                  value={motivoPerda}
                  onChange={(e) => setMotivoPerda(e.target.value)}
                  className="border-border/50"
                />
              </div>
            )}

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <Label className="text-sm cursor-pointer">
                  Compareceu à reunião
                  <span className="text-xs text-primary ml-1">(+30 pts)</span>
                </Label>
                <Switch checked={compareceu} onCheckedChange={setCompareceu} />
              </div>
              <div className="flex items-center justify-between py-1">
                <Label className="text-sm cursor-pointer">PIX Compromisso</Label>
                <Switch checked={pixCompromisso} onCheckedChange={setPixCompromisso} />
              </div>
            </div>

            <Separator className="my-2" />

            {/* Notas */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Observações
              </Label>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={4}
                className="border-border/50 focus:border-primary/50 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t px-6 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Excluir
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!empresa || !dataReuniao || isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir negócio?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O negócio será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
