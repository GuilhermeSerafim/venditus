import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useRoles } from "@/hooks/useRoles";
import { useOrganization } from "@/hooks/useOrganization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, Save } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";

const OrganizationSettings = () => {
  const { isAdmin, isLoading: rolesLoading } = useRoles();
  const { data: org, isLoading: orgLoading } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#DAA520"); // Default gold-ish

  useEffect(() => {
    if (org) {
      setName(org.name);
      if (org.theme_config?.primaryColor) {
        setPrimaryColor(org.theme_config.primaryColor);
      }
    }
  }, [org]);

  const updateOrgMutation = useMutation({
    mutationFn: async (values: { name: string; primaryColor: string }) => {
      if (!org) throw new Error("No organization found");

      const theme_config = {
        ...org.theme_config,
        primaryColor: values.primaryColor,
      };

      const { error } = await (supabase
        .from("organizations") as any)
        .update({ name: values.name, theme_config })
        .eq("id", org.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast({ title: "Configurações atualizadas com sucesso", description: "As alterações de tema podem levar alguns instantes para aparecer." });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao atualizar", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  if (rolesLoading || orgLoading) {
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

  if (!org) {
    return (
      <div className="min-h-screen bg-background dark:bg-gradient-radial-dark bg-gradient-radial-light">
        <AppSidebar />
        <div className="pl-[68px] min-h-screen">
          <TopBar />
          <main className="px-6 py-6">
            <div className="max-w-2xl mx-auto">
              <Card className="border-red-500/50 bg-red-500/10">
                <CardHeader>
                  <CardTitle className="text-red-600">Erro de Configuração</CardTitle>
                  <CardDescription className="text-red-600/90">
                    Não foi possível encontrar os dados da organização. Isso geralmente acontece se as migrações do banco de dados não foram aplicadas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Por favor, verifique se o arquivo <code>white_label_schema.sql</code> foi executado no Supabase.</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <AppLayout 
      title="Configurações da Organização" 
      description="Personalize a aparência e dados da sua organização"
    >
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Identidade Visual</CardTitle>
            <CardDescription>
              Personalize como sua organização aparece para os usuários.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Nome da Organização</Label>
              <Input 
                id="org-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Minha Empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary-color">Cor Principal (Tema)</Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="primary-color-picker" 
                  type="color" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input 
                  id="primary-color-text" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#000000"
                  className="font-mono uppercase"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Esta cor será aplicada a botões, destaques e elementos principais da interface.
              </p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => updateOrgMutation.mutate({ name, primaryColor })}
                disabled={updateOrgMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateOrgMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OrganizationSettings;
