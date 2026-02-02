import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddExpenseDialog = ({ open, onOpenChange }: AddExpenseDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const expenseData = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      amount: parseFloat(formData.get("amount") as string),
      expense_date: formData.get("expense_date") as string,
      notes: formData.get("notes") as string,
      user_id: user?.id,
    };

    try {
      const { error } = await supabase.from("expenses").insert([expenseData]);
      
      if (error) throw error;

      toast({
        title: "Despesa cadastrada",
        description: "Despesa adicionada com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      onOpenChange(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar a despesa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-gold">Cadastrar Nova Despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Despesa *</Label>
            <Input
              id="name"
              name="name"
              required
              className="bg-secondary border-border"
              placeholder="Ex: Aluguel da sala, Marketing Digital..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select name="type" required>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="sala">Sala</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="pessoal">Pessoal</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                className="bg-secondary border-border"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense_date">Data *</Label>
            <Input
              id="expense_date"
              name="expense_date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              className="bg-secondary border-border"
              placeholder="Informações adicionais..."
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
              {loading ? "Cadastrando..." : "Cadastrar Despesa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
