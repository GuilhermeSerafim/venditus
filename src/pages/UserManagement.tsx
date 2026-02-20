import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useRoles, AppRole, ROLE_LABELS } from "@/hooks/useRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import { TablePagination } from "@/components/TablePagination";
import { useOrganization } from "@/hooks/useOrganization";
import { useState, useMemo } from "react";
import { RoleMultiSelect } from "@/components/RoleMultiSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

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
  const { user: currentUser } = useAuth();
  const { isAdmin, isLoading: rolesLoading } = useRoles();
  const { data: organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = usersWithRoles.slice(startIndex, endIndex);

  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: AppRole[] }) => {
      if (!organization?.id) throw new Error("Organization ID not found");

      // First delete all existing roles
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      if (deleteError) throw deleteError;

      if (roles.length > 0) {
        // Then insert new roles
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert(
            roles.map(role => ({
              user_id: userId,
              role,
              organization_id: organization.id
            }))
          );
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      toast({ title: "Funções atualizadas com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar funções", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
      toast({ title: "Usuário excluído com sucesso" });
    },
    onError: (error: Error) => {
        toast({ 
            title: "Erro ao excluir usuário", 
            description: error.message,
            variant: "destructive" 
        });
    },
  });

  const getRoleBadges = (roles: AppRole[]) => {
    if (roles.length === 0) return <Badge variant="outline">Sem função</Badge>;
    
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map(role => (
          <Badge key={role} className="bg-gold text-primary-foreground font-medium whitespace-nowrap">
            {ROLE_LABELS[role]}
          </Badge>
        ))}
      </div>
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
      description="Gerencie as permissões e contas dos usuários do sistema"
    >
      <div className="mb-6 flex justify-end">
        <CreateUserDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função Atual</TableHead>
                <TableHead>Alterar Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => {
                const isCurrentUser = user.user_id === currentUser?.id;
                
                return (
                <TableRow 
                  key={user.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                >
                  <TableCell className="font-medium">{user.name || "Sem nome"}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{getRoleBadges(user.roles)}</TableCell>
                  <TableCell className="min-w-[250px]">
                    <RoleMultiSelect
                      selectedRoles={user.roles}
                      onChange={(newRoles) => 
                        updateRolesMutation.mutate({ userId: user.user_id, roles: newRoles })
                      }
                      disabled={isCurrentUser}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {!isCurrentUser && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário 
                            <strong> {user.email} </strong> e removerá seus dados de acesso.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => deleteUserMutation.mutate(user.user_id)}
                          >
                            {deleteUserMutation.isPending ? "Excluindo..." : "Excluir"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalItems={usersWithRoles.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="font-display">Permissões por Função</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold text-gold mb-2">Admin</h4>
              <p className="text-sm text-muted-foreground">
                Controle total dos módulos, configurações estratégicas (white-label, usuários, regras de pontuação).
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold text-gold mb-2">Comercial</h4>
              <p className="text-sm text-muted-foreground">
                Opera leads, vendas, interações e eventos. Acompanha ranking/pontuação de gamificação.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold text-gold mb-2">Financeiro</h4>
              <p className="text-sm text-muted-foreground">
                Acesso forte ao fluxo de caixa e validação de receita. Visualiza mesa de negócios para conferência, sem editar.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold text-gold mb-2">Auditor</h4>
              <p className="text-sm text-muted-foreground">
                Somente leitura de dashboards/KPIs. Sem acesso a detalhes sensíveis de negociações.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


    </AppLayout>
  );
};

export default UserManagement;