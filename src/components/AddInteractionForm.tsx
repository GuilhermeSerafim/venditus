import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface AddInteractionFormProps {
  leadId: string;
}

export const AddInteractionForm = ({ leadId }: AddInteractionFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      interaction_type: "note",
      description: "",
      outcome: "",
      next_action: "",
      next_action_date: "",
      created_by: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("interactions").insert({
        lead_id: leadId,
        ...values,
        interaction_date: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-interactions", leadId] });
      toast({ title: "Interação registrada com sucesso" });
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao registrar interação", variant: "destructive" });
    },
  });

  return (
    <Card className="border-border bg-background">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nova Interação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => addMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="interaction_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="call">Ligação</SelectItem>
                      <SelectItem value="meeting">Reunião</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="note">Nota</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea {...field} className="bg-card border-border" placeholder="Descreva a interação..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultado (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-card border-border" placeholder="Qual foi o resultado?" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="next_action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próxima Ação (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-card border-border" placeholder="O que fazer a seguir?" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="next_action_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Próxima Ação</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" className="bg-card border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="created_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-card border-border" placeholder="Seu nome" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-gold text-black hover:bg-gold/90">
              Registrar Interação
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
