import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";
import { AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { SituacaoNegocio } from "@/types/social-selling";
import { BusinessCard, type DealWithRelations } from "./BusinessCard";
import { cn } from "@/lib/utils";

// ─── Drop indicator line (Notion-style 2px bar) ──────────────────────────
const DropIndicator = () => (
  <div className="relative h-[2px] mx-1 my-0.5">
    <div className="absolute inset-0 bg-primary rounded-full" />
    {/* Dot at the left edge */}
    <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
  </div>
);

interface ColumnConfig {
  key: SituacaoNegocio;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface KanbanColumnProps {
  column: ColumnConfig;
  itemIds: string[];
  dealsMap: Record<string, DealWithRelations>;
  onCardClick: (deal: DealWithRelations) => void;
  onToggleCompareceu: (dealId: string, current: boolean) => void;
  onToggleQualificada: (dealId: string, current: boolean) => void;
  onToggleProposta: (dealId: string, current: boolean) => void;
}

export const KanbanColumn = ({
  column,
  itemIds,
  dealsMap,
  onCardClick,
  onToggleCompareceu,
  onToggleQualificada,
  onToggleProposta,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });
  const { active, over } = useDndContext();

  // Determine drop indicator position
  const activeId = active?.id as string | undefined;
  const overId = over?.id as string | undefined;
  const isActiveFromThisColumn = activeId ? itemIds.includes(activeId) : false;

  // Show indicator at a specific position in the list
  const getIndicatorPosition = (): number => {
    if (!activeId || !overId) return -1;
    // If hovering over the column droppable itself → show at end
    if (overId === column.key) return itemIds.length;
    // If hovering over a card in this column (and it's not the active card)
    const overIndex = itemIds.indexOf(overId);
    if (overIndex >= 0 && overId !== activeId) return overIndex;
    return -1;
  };

  const indicatorPos = getIndicatorPosition();

  return (
    <div className="flex flex-col min-h-0">
      {/* Column Header */}
      <div className="flex items-center gap-2 px-2 py-2.5 mb-2">
        <span className={cn("flex-shrink-0", column.color)}>{column.icon}</span>
        <span className={cn("font-semibold text-sm", column.color)}>{column.label}</span>
        <Badge
          variant="secondary"
          className="ml-auto text-[11px] font-medium bg-muted/60 text-muted-foreground border-0 px-2 py-0 h-5"
        >
          {itemIds.length}
        </Badge>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl p-1.5 min-h-[120px] transition-all duration-200",
          isOver && activeId && !isActiveFromThisColumn
            ? "bg-primary/5 ring-2 ring-dashed ring-primary/20"
            : "bg-muted/20"
        )}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {itemIds.length === 0 && !activeId ? (
              <div className="text-center py-10 text-sm border-2 border-dashed rounded-xl border-border/40 text-muted-foreground/40">
                Nenhum negócio
              </div>
            ) : itemIds.length === 0 && activeId ? (
              <>
                {indicatorPos === 0 && <DropIndicator />}
                <div
                  className={cn(
                    "text-center py-10 text-sm border-2 border-dashed rounded-xl transition-colors duration-200",
                    isOver
                      ? "border-primary/30 text-primary/60"
                      : "border-border/40 text-muted-foreground/40"
                  )}
                >
                  {isOver ? "Solte aqui" : "Nenhum negócio"}
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                {itemIds.map((id, index) => {
                  const deal = dealsMap[id];
                  if (!deal) return null;

                  return (
                    <div key={id}>
                      {/* Drop indicator BEFORE this card */}
                      {indicatorPos === index && <DropIndicator />}
                      <BusinessCard
                        deal={deal}
                        onCardClick={onCardClick}
                        onToggleCompareceu={onToggleCompareceu}
                        onToggleQualificada={onToggleQualificada}
                        onToggleProposta={onToggleProposta}
                      />
                    </div>
                  );
                })}
                {/* Drop indicator at END of column */}
                {indicatorPos === itemIds.length && <DropIndicator />}
              </div>
            )}
          </AnimatePresence>
        </SortableContext>
      </div>
    </div>
  );
};
