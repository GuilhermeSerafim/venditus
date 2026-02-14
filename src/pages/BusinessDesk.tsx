import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search,
  Handshake,
  Trophy,
  XCircle,
  Filter,
} from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMesaNegocios } from "@/hooks/useMesaNegocios";
import { AddDealDialog } from "@/components/business-desk/AddDealDialog";
import { DealSheet } from "@/components/business-desk/DealSheet";
import { ScoreBoard } from "@/components/business-desk/ScoreBoard";
import { KanbanColumn } from "@/components/business-desk/KanbanColumn";
import type { DealWithRelations } from "@/components/business-desk/BusinessCard";
import type { SituacaoNegocio } from "@/types/social-selling";

const COLUMNS: { key: SituacaoNegocio; label: string; icon: React.ReactNode; color: string; bgColor: string }[] = [
  {
    key: "NEGOCIANDO",
    label: "Negociando",
    icon: <Handshake className="h-4 w-4" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/30",
  },
  {
    key: "GANHO",
    label: "Ganho",
    icon: <Trophy className="h-4 w-4" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/30",
  },
  {
    key: "PERDIDO",
    label: "Perdido",
    icon: <XCircle className="h-4 w-4" />,
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/30",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const BusinessDesk = () => {
  const { deals, isLoading, updateDeal } = useMesaNegocios();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DealWithRelations | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSituacao, setFilterSituacao] = useState<string>("all");

  // DnD sensors — require movement before activating (prevents accidental drags / click conflicts)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        searchQuery === "" ||
        deal.empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSituacao = filterSituacao === "all" || deal.situacao === filterSituacao;

      return matchesSearch && matchesSituacao;
    });
  }, [deals, searchQuery, filterSituacao]);

  const handleToggleCompareceu = (dealId: string, current: boolean) => {
    updateDeal.mutate({ id: dealId, compareceu: !current });
  };

  const handleTogglePix = (dealId: string, current: boolean) => {
    updateDeal.mutate({ id: dealId, pix_compromisso: !current });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const targetColumn = over.id as string;

    // Only handle drops on column droppables
    const validColumns: SituacaoNegocio[] = ["NEGOCIANDO", "GANHO", "PERDIDO"];
    if (!validColumns.includes(targetColumn as SituacaoNegocio)) return;

    // Skip if same column
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.situacao === targetColumn) return;

    // Optimistic update fires instantly via the hook
    updateDeal.mutate({ id: dealId, situacao: targetColumn as SituacaoNegocio });
  };

  const dealsByStatus = useMemo(() => {
    const grouped: Record<SituacaoNegocio, typeof filteredDeals> = {
      NEGOCIANDO: [],
      GANHO: [],
      PERDIDO: [],
    };
    filteredDeals.forEach((deal) => {
      grouped[deal.situacao]?.push(deal);
    });
    return grouped;
  }, [filteredDeals]);

  // KPI metrics
  const totalDeals = deals.length;
  const totalNegociando = deals.filter((d) => d.situacao === "NEGOCIANDO").length;
  const totalGanho = deals.filter((d) => d.situacao === "GANHO").length;
  const totalValorGanho = deals
    .filter((d) => d.situacao === "GANHO")
    .reduce((sum, d) => sum + Number(d.valor_negocio), 0);

  return (
    <AppLayout
      title="Mesa de Negócios"
      description="Acompanhe suas reuniões e negociações em tempo real"
      actions={
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Reunião
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">Total Negócios</p>
              <p className="text-2xl font-bold text-foreground">{totalDeals}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-amber-500 font-medium">Negociando</p>
              <p className="text-2xl font-bold text-amber-500">{totalNegociando}</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-emerald-500 font-medium">Ganhos</p>
              <p className="text-2xl font-bold text-emerald-500">{totalGanho}</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4">
              <p className="text-xs text-emerald-500 font-medium">Receita Fechada</p>
              <p className="text-xl font-bold text-emerald-500 truncate">{formatCurrency(totalValorGanho)}</p>
            </CardContent>
          </Card>
        </div>

        {/* ScoreBoard */}
        <ScoreBoard />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa ou responsável..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-border"
            />
          </div>
          <Select value={filterSituacao} onValueChange={setFilterSituacao}>
            <SelectTrigger className="w-[160px] border-border">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="NEGOCIANDO">Negociando</SelectItem>
              <SelectItem value="GANHO">Ganho</SelectItem>
              <SelectItem value="PERDIDO">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Carregando negócios...</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.key}
                  column={column}
                  deals={dealsByStatus[column.key]}
                  onCardClick={setSelectedDeal}
                  onToggleCompareceu={handleToggleCompareceu}
                  onTogglePix={handleTogglePix}
                />
              ))}
            </div>
          </DndContext>
        )}
      </div>

      {/* Side-peek Sheet */}
      <AddDealDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      <DealSheet
        deal={selectedDeal}
        open={!!selectedDeal}
        onOpenChange={(open) => !open && setSelectedDeal(null)}
      />
    </AppLayout>
  );
};

export default BusinessDesk;
