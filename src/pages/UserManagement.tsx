import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useRoles, AppRole } from "@/hooks/useRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
}

interface UserWithRoles extends Profile {
  roles: AppRole[];
}

const UserManagement = () => {
  const { isAdmin, isLoading: rolesLoading } = useRoles();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("email");
      
      if (error) throw error;
      return data as Profile[];
    },
    enabled: isAdmin,
  });

  const { data: allUserRoles = [] } = useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const usersWithRoles: UserWithRoles[] = profiles.map((profile) => ({
    ...profile,
    roles: allUserRoles
      .filter((ur) => ur.user_id === profile.user_id)
      .map((ur) => ur.role as AppRole),
  }));

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      toast({ title: "Função atualizada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar função", variant: "destructive" });
    },
  });



  const getRoleBadge = (roles: AppRole[]) => {
    if (roles.length === 0) return <Badge variant="outline">Sem função</Badge>;
    
    const roleLabels: Record<AppRole, string> = {
      admin: "Admin",
      comercial: "Comercial",
      financeiro: "Financeiro",
      somente_leitura: "Somente Leitura",
    };

    const role = roles[0];
    return (
      <Badge className="bg-gold text-primary-foreground font-medium">
        {roleLabels[role]}
      </Badge>
    );
  };

  if (rolesLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-gradient-radial-dark bg-gradient-radial-light">
        <AppSidebar />
        <div className="pl-[68px] min-h-screen">
          <TopBar />
          <main className="px-6 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background dark:bg-gradient-radial-dark bg-gradient-radial-light">
        <AppSidebar />
        <div className="pl-[68px] min-h-screen">
          <TopBar />
          <main className="px-6 py-6">
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">Apenas administradores podem acessar esta página.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <AppLayout 
      title="Gestão de Usuários" 
      description="Gerencie as permissões dos usuários do sistema"
    >
      <Card className="mb-6 border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <UserCog className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Como Gerenciar Usuários</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">Criar Usuário:</strong> Acesse o{" "}
                  <a 
                    href="https://supabase.com/dashboard/project/pxgkgiifxjckuezemzzt/auth/users" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline font-medium"
                  >
                    Supabase Dashboard → Authentication → Users
                  </a>{" "}
                  → Clique em "Add user" → Depois atribua a função aqui abaixo.
                </p>
                <p>
                  <strong className="text-foreground">Deletar Usuário:</strong> No mesmo painel, clique nos 3 pontinhos (⋮) ao lado do usuário e selecione "Delete user".
                </p>
                <p>
                  <strong className="text-foreground">Alterar Função:</strong> Use a tabela abaixo (já funciona!).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função Atual</TableHead>
                <TableHead>Alterar Função</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersWithRoles.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "Sem nome"}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.roles)}</TableCell>
                  <TableCell>
                    <Select
                      value={user.roles[0] || ""}
                      onValueChange={(value) =>
                        updateRoleMutation.mutate({ userId: user.user_id, role: value as AppRole })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="somente_leitura">Somente Leitura</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Permissões por Função</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold text-gold mb-2">Admin</h4>
              <p className="text-sm text-muted-foreground">
                Acesso completo a todos os módulos: Leads, Vendas, Eventos, Produtos, Caixa, Exportar e Gestão de Usuários
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold text-gold mb-2">Comercial</h4>
              <p className="text-sm text-muted-foreground">
                Acesso a: Leads, Vendas, Eventos e Produtos (com permissão de edição)
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold text-gold mb-2">Financeiro</h4>
              <p className="text-sm text-muted-foreground">
                Acesso a: Vendas, Caixa e Exportar (com permissão de edição)
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold text-gold mb-2">Somente Leitura</h4>
              <p className="text-sm text-muted-foreground">
                Visualização apenas, sem permissão de edição em nenhum módulo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


    </AppLayout>
  );
};

export default UserManagement;