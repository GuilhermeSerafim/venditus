import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EditProductDialogProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProductDialog = ({ product, open, onOpenChange }: EditProductDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const form = useForm({
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (isEditing) {
        const { error } = await supabase
          .from("products")
          .update(values)
          .eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(values);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: isEditing ? "Produto atualizado" : "Produto criado" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Erro ao salvar produto", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-gold">
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-gold text-black hover:bg-gold/90">
              {isEditing ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
