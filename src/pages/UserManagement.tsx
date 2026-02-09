import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useRoles, AppRole } from "@/hooks/useRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import { TablePagination } from "@/components/TablePagination";
import { useState, useMemo } from "react";
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
              {paginatedUsers.map((user) => (
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
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
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