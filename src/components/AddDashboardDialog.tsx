import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, Info } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DATA_SOURCES = [
  { 
    value: "leads", 
    label: "Leads",
    fields: ["name", "company_name", "email", "phone", "status", "lead_source", "has_partner"]
  },
  { 
    value: "sales", 
    label: "Vendas",
    fields: ["sold_value", "net_value", "outstanding_value", "payment_status", "sale_date", "paid_date"]
  },
  { 
    value: "events", 
    label: "Eventos",
    fields: ["name", "event_date", "capacity", "leads_count", "confirmed_count", "attended_count", "negotiation_count", "purchased_count", "cost"]
  },
  { 
    value: "revenues", 
    label: "Receitas",
    fields: ["name", "amount", "category", "revenue_date"]
  },
  { 
    value: "expenses", 
    label: "Despesas",
    fields: ["name", "amount", "type", "expense_date"]
  },
];

const FORMULAS = [
  { value: "count", label: "Contar" },
  { value: "sum", label: "Somar" },
  { value: "avg", label: "Média" },
  { value: "percentage", label: "Porcentagem" },
  { value: "min", label: "Mínimo" },
  { value: "max", label: "Máximo" },
];

const VISUALIZATION_TYPES = [
  { value: "pie", label: "Pizza" },
  { value: "bar", label: "Barras" },
  { value: "line", label: "Linha" },
  { value: "kpi", label: "KPI" },
  { value: "table", label: "Tabela" },
];

const ICON_OPTIONS = [
  "BarChart3", "PieChart", "LineChart", "TrendingUp", "Activity",
  "DollarSign", "Users", "ShoppingCart", "Target", "Zap"
];

export const AddDashboardDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("BarChart3");
  const [color, setColor] = useState("#F2C94C");
  const [dataSource, setDataSource] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [formula, setFormula] = useState("");
  const [customFormula, setCustomFormula] = useState("");
  const [useCustomFormula, setUseCustomFormula] = useState(false);
  const [visualizationType, setVisualizationType] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSuggest = () => {
    // Lógica de sugestão inteligente baseada na fonte de dados
    if (dataSource === "leads") {
      setName("Distribuição de Leads por Status");
      setUseCustomFormula(true);
      setCustomFormula("COUNT(*) GROUP BY status");
      setVisualizationType("pie");
      toast({
        title: "Sugestão aplicada",
        description: "Dashboard configurado para mostrar distribuição de leads",
      });
    } else if (dataSource === "sales") {
      setName("Receita Total");
      setUseCustomFormula(true);
      setCustomFormula("SUM(net_value)");
      setVisualizationType("kpi");
      toast({
        title: "Sugestão aplicada",
        description: "Dashboard configurado para mostrar receita total",
      });
    } else if (dataSource === "events") {
      setName("Taxa de Conversão Média");
      setUseCustomFormula(true);
      setCustomFormula("AVG(purchased_count / attended_count * 100)");
      setVisualizationType("kpi");
      toast({
        title: "Sugestão aplicada",
        description: "Dashboard configurado para mostrar taxa de conversão",
      });
    } else if (dataSource === "revenues") {
      setName("Receitas por Categoria");
      setUseCustomFormula(true);
      setCustomFormula("SUM(amount) GROUP BY category");
      setVisualizationType("bar");
      toast({
        title: "Sugestão aplicada",
        description: "Dashboard configurado para receitas por categoria",
      });
    } else if (dataSource === "expenses") {
      setName("Despesas por Tipo");
      setUseCustomFormula(true);
      setCustomFormula("SUM(amount) GROUP BY type");
      setVisualizationType("bar");
      toast({
        title: "Sugestão aplicada",
        description: "Dashboard configurado para despesas por tipo",
      });
    }
  };

  const handleSubmit = async () => {
    const finalFormula = useCustomFormula ? customFormula : formula;
    
    if (!name || !dataSource || !finalFormula || !visualizationType) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("custom_dashboards").insert({
        user_id: user.id,
        name,
        description,
        icon,
        color,
        data_source: dataSource,
        fields: fields,
        formula: finalFormula,
        visualization_type: visualizationType,
        order_position: 0,
      });

      if (error) throw error;

      toast({
        title: "Dashboard criado",
        description: "Seu dashboard personalizado foi criado com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ["custom-dashboards"] });
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro ao criar dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("BarChart3");
    setColor("#F2C94C");
    setDataSource("");
    setFields([]);
    setFormula("");
    setCustomFormula("");
    setUseCustomFormula(false);
    setVisualizationType("");
  };

  const selectedSource = DATA_SOURCES.find(s => s.value === dataSource);
  const availableFields = selectedSource?.fields || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Dashboard Personalizado</DialogTitle>
          <DialogDescription>
            Configure seu dashboard com dados e visualizações personalizadas
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Receita por Mês"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo deste dashboard"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Ícone</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((iconName) => {
                    const IconComponent = (LucideIcons as any)[iconName];
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          {iconName}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataSource">Origem dos Dados *</Label>
              <Select value={dataSource} onValueChange={setDataSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {dataSource && availableFields.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Campos disponíveis:</strong> {availableFields.join(", ")}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="useCustomFormula"
                checked={useCustomFormula}
                onChange={(e) => setUseCustomFormula(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="useCustomFormula" className="cursor-pointer">
                Usar fórmula personalizada (avançado)
              </Label>
            </div>

            {useCustomFormula ? (
              <div className="space-y-2">
                <Label htmlFor="customFormula">Fórmula Personalizada *</Label>
                <Textarea
                  id="customFormula"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  placeholder="Ex: SUM(net_value) / COUNT(*)"
                  rows={3}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Funções: SUM(), AVG(), COUNT(), MIN(), MAX(), ROUND(), IF(), GROUP BY
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="formula">Fórmula Predefinida *</Label>
                <Select value={formula} onValueChange={setFormula}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMULAS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="visualizationType">Tipo de Visualização *</Label>
            <Select value={visualizationType} onValueChange={setVisualizationType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {VISUALIZATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={handleSuggest}
            disabled={!dataSource}
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Sugerir Configuração
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Criando..." : "Criar Dashboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
