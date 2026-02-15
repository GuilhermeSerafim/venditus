import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/useRoles";
import { RoleMultiSelect } from "@/components/RoleMultiSelect";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddUserDialog = ({ open, onOpenChange }: AddUserDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<AppRole[]>(["somente_leitura"]);

  const createUserMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string; roles: AppRole[] }) => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (!session.access_token) {
        console.error('No access token in session');
        throw new Error('Token de acesso inválido. Por favor, faça login novamente.');
      }

      console.log('Calling create-user function with token');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Create user error:', error);
        throw new Error(error.error || "Erro ao criar usuário");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      toast({ title: "Usuário criado com sucesso" });
      setName("");
      setEmail("");
      setPassword("");
      setRoles(["somente_leitura"]);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao criar usuário", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || roles.length === 0) {
      toast({ 
        title: "Campos obrigatórios", 
        description: "Preencha todos os campos obrigatórios e selecione pelo menos uma função.",
        variant: "destructive" 
      });
      return;
    }

    createUserMutation.mutate({ name, email, password, roles });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-gold">Adicionar Novo Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha temporária"
              required
              minLength={6}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Funções *</Label>
            <RoleMultiSelect selectedRoles={roles} onChange={setRoles} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-background"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="bg-gold hover:bg-gold/90 text-black"
            >
              {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
