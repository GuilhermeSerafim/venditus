import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { AppRole } from "@/hooks/useRoles";
import { useOrganization } from "@/hooks/useOrganization";

interface CreateUserDialogProps {
  onUserCreated?: () => void;
}

export const CreateUserDialog = ({ onUserCreated }: CreateUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: org } = useOrganization();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      roles: ["comercial"] as AppRole[],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      // Debug: Check authentication state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔍 Debug - Session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        sessionError,
        userId: session?.user?.id,
        tokenLength: session?.access_token?.length,
      });

      if (!session || !session.access_token) {
        throw new Error('Você não está autenticado. Por favor, faça login novamente.');
      }

      // Check if token is about to expire (less than 5 minutes remaining)
      const tokenExpiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeToExpiry = tokenExpiresAt ? tokenExpiresAt - now : 0;
      
      console.log('⏰ Token expiry check:', {
        expiresAt: new Date(tokenExpiresAt! * 1000).toISOString(),
        timeToExpiry: `${Math.floor(timeToExpiry / 60)} minutes`,
        needsRefresh: timeToExpiry < 300,
      });

      // Try to refresh if token is expiring soon
      if (timeToExpiry < 300) {
        console.log('🔄 Token expiring soon, refreshing session...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('❌ Session refresh failed:', refreshError);
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        
        console.log('✅ Session refreshed successfully');
      }

      console.log('📤 Calling create-user function with:', {
        email: values.email,
        name: values.name,
        roles: values.roles,
        organization_id: org?.id,
      });

      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          ...values,
          organization_id: org?.id,
        },
      });

      console.log('📥 Response from create-user:', { 
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        dataError: data?.error,
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }
      
      if (data?.error) {
        console.error('❌ Create user error:', data.error);
        throw new Error(data.error);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      toast({ title: "Usuário criado com sucesso" });
      setOpen(false);
      form.reset();
      onUserCreated?.();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao criar usuário", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold text-black hover:bg-gold/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-gold">Criar Novo Usuário</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nome é obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="João Silva" className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              rules={{ required: "Email é obrigatório", pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="joao@exemplo.com" className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              rules={{ required: "Senha é obrigatória", minLength: { value: 6, message: "Mínimo 6 caracteres" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="******" className="bg-background border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funções</FormLabel>
                  <FormControl>
                    <RoleMultiSelectRoleWrapper 
                      value={field.value} 
                      onChange={field.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-gold text-black hover:bg-gold/90"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Usuário"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Wrapper simple component to bridge between hook-form and RoleMultiSelect
import { RoleMultiSelect } from "@/components/RoleMultiSelect";

const RoleMultiSelectRoleWrapper = ({ value, onChange }: { value: AppRole[], onChange: (val: AppRole[]) => void }) => {
  return <RoleMultiSelect selectedRoles={value} onChange={onChange} />;
};
