import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { SituacaoNegocio } from "@/types/social-selling";
import { BusinessCard, type DealWithRelations } from "./BusinessCard";
import { cn } from "@/lib/utils";

interface ColumnConfig {
  key: SituacaoNegocio;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface KanbanColumnProps {
  column: ColumnConfig;
  deals: DealWithRelations[];
  onCardClick: (deal: DealWithRelations) => void;
  onToggleCompareceu: (dealId: string, current: boolean) => void;
  onTogglePix: (dealId: string, current: boolean) => void;
}

export const KanbanColumn = ({
  column,
  deals,
  onCardClick,
  onToggleCompareceu,
  onTogglePix,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

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
          {deals.length}
        </Badge>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-xl p-1.5 space-y-2 min-h-[120px] transition-all duration-200",
          isOver
            ? "bg-primary/5 ring-2 ring-dashed ring-primary/25"
            : "bg-muted/20"
        )}
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {deals.length === 0 ? (
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
            ) : (
              deals.map((deal) => (
                <BusinessCard
                  key={deal.id}
                  deal={deal}
                  onCardClick={onCardClick}
                  onToggleCompareceu={onToggleCompareceu}
                  onTogglePix={onTogglePix}
                />
              ))
            )}
          </AnimatePresence>
        </SortableContext>
      </div>
    </div>
  );
};
