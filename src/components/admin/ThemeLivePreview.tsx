import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Bell, User } from "lucide-react";

interface ThemeLivePreviewProps {
  primaryColor: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}

export const ThemeLivePreview = ({
  primaryColor,
  secondaryColor = "#6B7280",
  tertiaryColor,
}: ThemeLivePreviewProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-lg">Prévia</CardTitle>
        <CardDescription>Veja como sua identidade visual ficará aplicada</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Sample Navbar */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div
            className="h-12 w-full flex items-center justify-between px-4 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="font-bold flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white/20" />
              <span>Logo</span>
            </div>
            <div className="flex gap-2 text-sm opacity-90">
              <span>Menu</span>
              <span>Perfil</span>
            </div>
          </div>
          <div className="p-4 bg-background">
            <h3 className="font-semibold mb-2">Painel Principal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Este é um exemplo de como o conteúdo aparecerá.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button style={{ backgroundColor: primaryColor, color: "#fff" }}>
                Ação Principal
              </Button>
              <Button style={{ backgroundColor: secondaryColor, color: "#fff" }}>
                Ação Secundária
              </Button>
              <Button variant="outline" style={{ borderColor: primaryColor, color: primaryColor }}>
                Botão Outline
              </Button>
            </div>
          </div>
        </div>

        {/* Badges & Icons */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded border border-border bg-card">
            <span className="text-sm font-medium mb-2 block">Badges</span>
            <div className="flex flex-wrap gap-2">
              <Badge style={{ backgroundColor: primaryColor }}>Novo</Badge>
              <Badge style={{ backgroundColor: secondaryColor }}>Rascunho</Badge>
              {tertiaryColor && <Badge style={{ backgroundColor: tertiaryColor }}>Destaque</Badge>}
            </div>
          </div>
          <div className="p-4 rounded border border-border bg-card">
            <span className="text-sm font-medium mb-2 block">Ícones</span>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                <Check size={16} />
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: secondaryColor }}>
                <User size={16} />
              </div>
              {tertiaryColor && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: tertiaryColor }}>
                  <Bell size={16} />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
