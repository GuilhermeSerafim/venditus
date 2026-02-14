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
import { Shield, Loader2, Save, Upload, Image as ImageIcon, RotateCcw } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { ThemeLivePreview } from "@/components/admin/ThemeLivePreview";

const OrganizationSettings = () => {
  const { isAdmin, isLoading: rolesLoading } = useRoles();
  const { data: org, isLoading: orgLoading } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#DAA520"); // Default gold-ish
  const [secondaryColor, setSecondaryColor] = useState("#6B7280"); // Default gray
  const [tertiaryColor, setTertiaryColor] = useState(""); // Optional
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (org) {
      setName(org.name);
      if (org.theme_config?.primaryColor) {
        setPrimaryColor(org.theme_config.primaryColor);
      }
      if (org.theme_config?.secondaryColor) {
        setSecondaryColor(org.theme_config.secondaryColor);
      }
      if (org.theme_config?.tertiaryColor) {
        setTertiaryColor(org.theme_config.tertiaryColor);
      }
      if (org.theme_config?.logoUrl) {
        setLogoUrl(org.theme_config.logoUrl);
      }
    }
  }, [org]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !org) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({ 
        title: "Arquivo muito grande", 
        description: "O tamanho máximo é 2MB", 
        variant: "destructive" 
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({ 
        title: "Tipo de arquivo inválido", 
        description: "Apenas PNG, JPG ou SVG são permitidos", 
        variant: "destructive" 
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to storage: organization-logos/{org_id}/{filename}
      const filePath = `${org.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      // Update organization theme_config with new logo URL
      const theme_config = {
        ...org.theme_config,
        primaryColor: org.theme_config?.primaryColor || "#DAA520",
        logoUrl: publicUrl,
      };

      const { error: updateError } = await (supabase
        .from("organizations") as any)
        .update({ theme_config })
        .eq("id", org.id);

      if (updateError) throw updateError;

      setLogoUrl(publicUrl);
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast({ title: "Logo atualizada com sucesso!" });
    } catch (error: any) {
      toast({ 
        title: "Erro ao fazer upload", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const updateOrgMutation = useMutation({
    mutationFn: async (values: { 
      name: string; 
      primaryColor: string;
      secondaryColor?: string;
      tertiaryColor?: string;
    }) => {
      if (!org) throw new Error("No organization found");

      const theme_config = {
        ...org.theme_config,
        primaryColor: values.primaryColor,
        secondaryColor: values.secondaryColor,
        tertiaryColor: values.tertiaryColor || null,
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

  const handleReset = async () => {
    if (!org) return;
    
    const defaultPrimary = "#DAA520"; // Default gold
    const defaultSecondary = "#6B7280"; // Default gray
    
    // Update local state immediately for visual feedback
    setPrimaryColor(defaultPrimary);
    setSecondaryColor(defaultSecondary);
    setTertiaryColor("");
    
    try {
      // Save to database
      const theme_config = {
        ...org.theme_config,
        primaryColor: defaultPrimary,
        secondaryColor: defaultSecondary,
        tertiaryColor: null,
      };

      const { error } = await (supabase
        .from("organizations") as any)
        .update({ theme_config })
        .eq("id", org.id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast({ 
        title: "Cores resetadas com sucesso!", 
        description: "As cores foram restauradas para os valores padrão." 
      });
    } catch (error: any) {
      toast({ 
        title: "Erro ao resetar cores", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
        {/* Settings Form */}
        <div className="lg:col-span-2">
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
              <Label>Logo da Organização</Label>
              
              {/* Current Logo Preview */}
              {logoUrl && (
                <div className="mb-4 p-4 border border-border rounded-lg bg-muted/30">
                  <img 
                    src={logoUrl} 
                    alt="Logo atual"
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
              
              {/* Upload Input */}
              <div className="flex items-center gap-3">
                <Input 
                  id="logo-upload"
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou SVG. Máximo 2MB. Recomendado: 200x50px ou similar.
              </p>
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
                  placeholder="#DAA520"
                  className="font-mono uppercase"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Botões principais, links, badges ativos, destaques.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Cor Secundária</Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="secondary-color-picker" 
                  type="color" 
                  value={secondaryColor} 
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input 
                  id="secondary-color-text" 
                  value={secondaryColor} 
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#6B7280"
                  className="font-mono uppercase"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Botões secundários, fundos de cards, ícones de suporte.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tertiary-color">
                Cor Terciária <span className="text-muted-foreground text-xs">(Opcional)</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="tertiary-color-picker" 
                  type="color" 
                  value={tertiaryColor || "#000000"} 
                  onChange={(e) => setTertiaryColor(e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input 
                  id="tertiary-color-text" 
                  value={tertiaryColor} 
                  onChange={(e) => setTertiaryColor(e.target.value)}
                  placeholder="#000000 (opcional)"
                  className="font-mono uppercase"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Badges especiais, alertas, elementos decorativos.
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              <Button 
                onClick={() => updateOrgMutation.mutate({ 
                  name, 
                  primaryColor,
                  secondaryColor,
                  tertiaryColor: tertiaryColor || undefined
                })}
                disabled={updateOrgMutation.isPending}
                className="flex-1 sm:flex-initial"
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
              
              <Button 
                onClick={handleReset}
                variant="outline"
                className="flex-1 sm:flex-initial"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Resetar Cores
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ThemeLivePreview
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              tertiaryColor={tertiaryColor}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OrganizationSettings;
