import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { MesaNegocios, SituacaoNegocio } from "@/types/social-selling";

export const useMesaNegocios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["mesa_negocios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mesa_negocios")
        .select("*, profiles!mesa_negocios_responsavel_id_fkey(name, email), leads(name)")
        .order("data_reuniao", { ascending: false });

      if (error) throw error;
      return data as (MesaNegocios & {
        profiles: { name: string | null; email: string } | null;
        leads: { name: string } | null;
      })[];
    },
    enabled: !!user,
  });

  const createDeal = useMutation({
    mutationFn: async (deal: Omit<MesaNegocios, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("mesa_negocios")
        .insert(deal as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mesa_negocios"] });
      toast({ title: "Negócio criado", description: "Reunião agendada com sucesso! (+20 pontos)" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const updateDeal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MesaNegocios> & { id: string }) => {
      const { data, error } = await supabase
        .from("mesa_negocios")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mesa_negocios"] });
      
      if (variables.compareceu === true) {
        toast({ title: "Comparecimento confirmado!", description: "+30 pontos de bônus!" });
      } else if (variables.situacao === "GANHO") {
        toast({ title: "🎉 Negócio fechado!", description: "+100 pontos! Parabéns!" });
      } else if (variables.situacao === "PERDIDO") {
        toast({ title: "Negócio perdido", description: "Registrado. Siga em frente!" });
      } else {
        toast({ title: "Atualizado", description: "Negócio atualizado com sucesso." });
      }
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const deleteDeal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("mesa_negocios")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mesa_negocios"] });
      toast({ title: "Excluído", description: "Negócio removido." });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  return {
    deals: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createDeal,
    updateDeal,
    deleteDeal,
  };
};
