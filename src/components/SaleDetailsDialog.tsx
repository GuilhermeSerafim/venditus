import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, Package, User, FileText, CreditCard, Circle, CheckCircle2 } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useToast } from "@/hooks/use-toast";

interface SaleDetailsDialogProps {
  sale: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InstallmentStatus {
  number: number;
  paid: boolean;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  boleto: "Boleto",
  cartao_credito: "Cartão de Crédito",
  transferencia: "Transferência",
  dinheiro: "Dinheiro",
  parcelado: "Parcelado",
};

export const SaleDetailsDialog = ({ sale, open, onOpenChange }: SaleDetailsDialogProps) => {
  const { canEditSales } = useRoles();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leadData } = useQuery({
    queryKey: ["lead", sale?.lead_id],
    queryFn: async () => {
      if (!sale?.lead_id) return null;
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("id", sale.lead_id)
        .single();
      return data;
    },
    enabled: !!sale?.lead_id && open,
  });

  const { data: productData } = useQuery({
    queryKey: ["product", sale?.product_id],
    queryFn: async () => {
      if (!sale?.product_id) return null;
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", sale.product_id)
        .single();
      return data;
    },
    enabled: !!sale?.product_id && open,
  });

  const updateInstallmentsMutation = useMutation({
    mutationFn: async (newStatus: InstallmentStatus[]) => {
      const { error } = await supabase
        .from("sales")
        .update({ installments_status: newStatus as unknown as any })
        .eq("id", sale.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({ title: "Status da parcela atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar parcela", variant: "destructive" });
    },
  });

  const toggleInstallmentStatus = (index: number) => {
    if (!canEditSales) return;
    
    const currentStatus: InstallmentStatus[] = sale.installments_status || [];
    const newStatus = currentStatus.map((item: InstallmentStatus, i: number) =>
      i === index ? { ...item, paid: !item.paid } : item
    );
    updateInstallmentsMutation.mutate(newStatus);
  };

  if (!sale) return null;

  const installmentsStatus: InstallmentStatus[] = sale.installments_status || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Detalhes da Venda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cliente */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <h3 className="font-semibold text-foreground">Cliente</h3>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium text-foreground">{leadData?.name || "Carregando..."}</p>
              </div>
              {leadData?.company_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-medium text-foreground">{leadData.company_name}</p>
                </div>
              )}
              {leadData?.cpf && (
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium text-foreground">{leadData.cpf}</p>
                </div>
              )}
              {leadData?.cnpj && (
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-medium text-foreground">{leadData.cnpj}</p>
                </div>
              )}
              {leadData?.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{leadData.email}</p>
                </div>
              )}
              {leadData?.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium text-foreground">{leadData.phone}</p>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Produto */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <h3 className="font-semibold text-foreground">Produto</h3>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium text-foreground">{productData?.name || "Carregando..."}</p>
              </div>
              {productData?.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="font-medium text-foreground">{productData.description}</p>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Valores */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <h3 className="font-semibold text-foreground">Valores</h3>
            </div>
            <div className="pl-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Valor Vendido</p>
                <p className="text-lg font-bold text-gold">
                  R$ {Number(sale.sold_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Líquido</p>
                <p className="text-lg font-bold text-green-500">
                  R$ {Number(sale.net_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {sale.outstanding_value > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Valor Pendente</p>
                  <p className="text-lg font-bold text-orange-500">
                    R$ {Number(sale.outstanding_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Pagamento */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <h3 className="font-semibold text-foreground">Pagamento</h3>
            </div>
            <div className="pl-6 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Forma de Pagamento</p>
                <Badge className="bg-gold/10 text-gold">
                  {PAYMENT_METHOD_LABELS[sale.payment_method] || sale.payment_method || "Pix"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className={sale.payment_status === "paid" ? "bg-green-500/10 text-green-500" : "bg-gold/10 text-gold"}>
                  {sale.payment_status === "paid" ? "Pago" : "Pendente"}
                </Badge>
              </div>
              
              {/* Parcelas */}
              {sale.payment_method === "parcelado" && installmentsStatus.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Parcelas ({installmentsStatus.filter((i: InstallmentStatus) => i.paid).length}/{installmentsStatus.length} pagas)
                    {canEditSales && " - Clique para alterar"}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {installmentsStatus.map((installment: InstallmentStatus, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleInstallmentStatus(index)}
                        disabled={!canEditSales}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          installment.paid 
                            ? "border-green-500/50 bg-green-500/10 text-green-500" 
                            : "border-gold/50 bg-gold/10 text-gold"
                        } ${canEditSales ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                      >
                        {installment.paid ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">Parcela {installment.number}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data da Venda</p>
                  <p className="font-medium text-foreground">
                    {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              {sale.expected_payment_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Previsão de Pagamento</p>
                    <p className="font-medium text-foreground">
                      {new Date(sale.expected_payment_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
              {sale.paid_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data do Pagamento</p>
                    <p className="font-medium text-foreground">
                      {new Date(sale.paid_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {sale.seller_name && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <h3 className="font-semibold text-foreground">Vendedor</h3>
                </div>
                <div className="pl-6">
                  <p className="font-medium text-foreground">{sale.seller_name}</p>
                </div>
              </div>
            </>
          )}

          {sale.notes && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-semibold text-foreground">Observações</h3>
                </div>
                <div className="pl-6">
                  <p className="text-foreground whitespace-pre-wrap">{sale.notes}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};