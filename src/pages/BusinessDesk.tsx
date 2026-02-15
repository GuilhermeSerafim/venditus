import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type CollisionDetection,
  type UniqueIdentifier,
  pointerWithin,
  rectIntersection,
  closestCenter,
  getFirstCollision,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMesaNegocios } from "@/hooks/useMesaNegocios";
import { AddDealDialog } from "@/components/business-desk/AddDealDialog";
import { DealSheet } from "@/components/business-desk/DealSheet";
import { ScoreBoard } from "@/components/business-desk/ScoreBoard";
import { KanbanColumn } from "@/components/business-desk/KanbanColumn";
import { DragOverlayCard, type DealWithRelations } from "@/components/business-desk/BusinessCard";
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

  // ─── DnD state ──────────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);

  // Local column ordering — { NEGOCIANDO: [id1, id2], GANHO: [...], PERDIDO: [...] }
  const [columnItems, setColumnItems] = useState<Record<SituacaoNegocio, string[]>>({
    NEGOCIANDO: [],
    GANHO: [],
    PERDIDO: [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  // ─── Filtered deals + lookup map ───────────────────────────────────────
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

  const dealsMap = useMemo(() => {
    const map: Record<string, DealWithRelations> = {};
    deals.forEach((d) => { map[d.id] = d; });
    return map;
  }, [deals]);

  // Sync columnItems from server data (skip during drag)
  useEffect(() => {
    if (activeId) return;
    const grouped: Record<SituacaoNegocio, string[]> = { NEGOCIANDO: [], GANHO: [], PERDIDO: [] };
    filteredDeals.forEach((deal) => {
      grouped[deal.situacao]?.push(deal.id);
    });
    setColumnItems(grouped);
  }, [filteredDeals, activeId]);

  // ─── Container helpers ─────────────────────────────────────────────────
  const findContainer = useCallback(
    (id: UniqueIdentifier): SituacaoNegocio | undefined => {
      if (id in columnItems) return id as SituacaoNegocio;
      return (Object.keys(columnItems) as SituacaoNegocio[]).find((key) =>
        columnItems[key].includes(id as string)
      );
    },
    [columnItems]
  );

  // ─── Custom collision detection (multi-container) ──────────────────────
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // If dragging over a column directly, prioritize that
      const pointerCollisions = pointerWithin(args);
      const intersections =
        pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);

      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        // If hovering over a column container, find closest card inside
        if (overId in columnItems) {
          const containerItems = columnItems[overId as SituacaoNegocio];
          if (containerItems.length > 0) {
            const closest = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (c) => c.id !== overId && containerItems.includes(c.id as string)
              ),
            });
            if (closest.length > 0) {
              overId = closest[0].id;
            }
          }
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // Fallback to last known position
      if (lastOverId.current) {
        return [{ id: lastOverId.current }];
      }
      return [];
    },
    [columnItems]
  );

  // ─── Drag handlers ─────────────────────────────────────────────────────
  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    // Move item from one column to another in local state
    setColumnItems((prev) => {
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];

      const activeIndex = activeItems.indexOf(active.id as string);
      if (activeIndex < 0) return prev;

      activeItems.splice(activeIndex, 1);

      // Determine insertion index
      const overIndex = overItems.indexOf(over.id as string);
      const newIndex = overIndex >= 0 ? overIndex : overItems.length;
      overItems.splice(newIndex, 0, active.id as string);

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      };
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      // Within-container reorder
      const items = columnItems[activeContainer];
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);

      if (oldIndex !== newIndex && newIndex >= 0) {
        setColumnItems((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex),
        }));
      }
    }

    // Persist status change if column changed
    const deal = dealsMap[active.id as string];
    const finalContainer = findContainer(active.id);
    if (deal && finalContainer && deal.situacao !== finalContainer) {
      updateDeal.mutate({ id: deal.id, situacao: finalContainer });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Active deal for DragOverlay
  const activeDeal = activeId ? dealsMap[activeId as string] : null;

  const handleToggleCompareceu = (dealId: string, current: boolean) => {
    updateDeal.mutate({ id: dealId, compareceu: !current });
  };



  const handleToggleQualificada = (dealId: string, current: boolean) => {
    updateDeal.mutate({ id: dealId, qualificada: !current });
  };

  const handleToggleProposta = (dealId: string, current: boolean) => {
    updateDeal.mutate({ id: dealId, proposta_enviada: !current });
  };

  // ─── KPI metrics ──────────────────────────────────────────────────────
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
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.key}
                  column={column}
                  itemIds={columnItems[column.key]}
                  dealsMap={dealsMap}
                  onCardClick={setSelectedDeal}
                  onToggleCompareceu={handleToggleCompareceu}

                  onToggleQualificada={handleToggleQualificada}
                  onToggleProposta={handleToggleProposta}
                />
              ))}
            </div>

            {/* DragOverlay — rendered outside the list, follows cursor */}
            <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
              {activeDeal ? <DragOverlayCard deal={activeDeal} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Side-peek Sheet + Add dialog */}
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
