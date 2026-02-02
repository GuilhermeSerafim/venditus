import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Circle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface EditSaleDialogProps {
  sale: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InstallmentStatus {
  number: number;
  paid: boolean;
}

export const EditSaleDialog = ({ sale, open, onOpenChange }: EditSaleDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!sale;

  const [installmentsStatus, setInstallmentsStatus] = useState<InstallmentStatus[]>([]);

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const parseInstallmentsStatus = (jsonb: any): InstallmentStatus[] => {
    if (Array.isArray(jsonb)) return jsonb;
    return [];
  };

  const form = useForm({
    defaultValues: {
      lead_id: sale?.lead_id || "",
      product_id: sale?.product_id || "",
      sold_value: sale?.sold_value?.toString() || "0",
      outstanding_value: sale?.outstanding_value?.toString() || "0",
      net_value: sale?.net_value?.toString() || "0",
      sale_date: sale?.sale_date || new Date().toISOString().split("T")[0],
      expected_payment_date: sale?.expected_payment_date || "",
      paid_date: sale?.paid_date || "",
      payment_status: sale?.payment_status || "pending",
      payment_method: sale?.payment_method || "pix",
      installments_count: sale?.installments_count?.toString() || "1",
      seller_name: sale?.seller_name || "",
      notes: sale?.notes || "",
    },
  });

  const paymentMethod = useWatch({ control: form.control, name: "payment_method" });
  const installmentsCount = useWatch({ control: form.control, name: "installments_count" });

  useEffect(() => {
    if (sale?.installments_status) {
      setInstallmentsStatus(parseInstallmentsStatus(sale.installments_status));
    }
  }, [sale]);

  useEffect(() => {
    if (paymentMethod === "parcelado") {
      const count = parseInt(installmentsCount) || 1;
      const existingStatuses = [...installmentsStatus];
      
      if (count > existingStatuses.length) {
        for (let i = existingStatuses.length; i < count; i++) {
          existingStatuses.push({ number: i + 1, paid: false });
        }
      } else if (count < existingStatuses.length) {
        existingStatuses.length = count;
      }
      
      setInstallmentsStatus(existingStatuses.map((s, i) => ({ ...s, number: i + 1 })));
    }
  }, [paymentMethod, installmentsCount]);

  const toggleInstallmentStatus = (index: number) => {
    setInstallmentsStatus((prev) =>
      prev.map((item, i) => (i === index ? { ...item, paid: !item.paid } : item))
    );
  };

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      const saleData = {
        ...values,
        sold_value: parseFloat(values.sold_value) || 0,
        outstanding_value: parseFloat(values.outstanding_value) || 0,
        net_value: parseFloat(values.net_value) || 0,
        installments_count: values.payment_method === "parcelado" ? parseInt(values.installments_count) || 1 : 1,
        installments_status: values.payment_method === "parcelado" ? installmentsStatus : [],
      };
      
      if (isEditing) {
        const { error } = await supabase
          .from("sales")
          .update(saleData)
          .eq("id", sale.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sales").insert({
          ...saleData,
          user_id: user?.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({ title: isEditing ? "Venda atualizada" : "Venda registrada" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Erro ao salvar venda", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gold">
            {isEditing ? "Editar Venda" : "Nova Venda"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lead_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leads?.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="sold_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Vendido</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outstanding_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Em Aberto</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="net_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Líquido</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sale_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Venda</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pix">Pix</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="parcelado">Parcelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {paymentMethod === "parcelado" && (
              <div className="space-y-4 p-4 border border-border rounded-lg bg-background/50">
                <FormField
                  control={form.control}
                  name="installments_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Parcelas</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min="1" 
                          max="48" 
                          className="bg-background border-border w-32" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {installmentsStatus.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Clique para alterar o status:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {installmentsStatus.map((installment, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => toggleInstallmentStatus(index)}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                            installment.paid 
                              ? "border-green-500/50 bg-green-500/10 text-green-500" 
                              : "border-gold/50 bg-gold/10 text-gold"
                          }`}
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
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expected_payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previsão Recebimento</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paid_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Pagamento</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seller_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendedor</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-background border-border" />
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
                    <Textarea {...field} className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-gold text-black hover:bg-gold/90">
              {isEditing ? "Salvar Alterações" : "Registrar Venda"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};