import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  CheckCircle2,
  BanknoteIcon,
  GripVertical,
  User,
} from "lucide-react";
import type { MesaNegocios } from "@/types/social-selling";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const getInitials = (name: string | null, email: string) => {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return email.substring(0, 2).toUpperCase();
};

export interface DealWithRelations extends MesaNegocios {
  profiles: { name: string | null; email: string } | null;
  leads: { name: string } | null;
}

// ─── Card internals (shared by sortable + overlay) ────────────────────────
interface CardContentProps {
  deal: DealWithRelations;
  onToggleCompareceu?: (dealId: string, current: boolean) => void;
  onTogglePix?: (dealId: string, current: boolean) => void;
  showHandle?: boolean;
  handleProps?: Record<string, any>;
}

const CardInternals = ({
  deal,
  onToggleCompareceu,
  onTogglePix,
  showHandle,
  handleProps,
}: CardContentProps) => (
  <div className="flex gap-2">
    {/* Drag handle */}
    {showHandle && (
      <button
        {...handleProps}
        className={cn(
          "self-center p-1 rounded-md flex-shrink-0",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50",
          "cursor-grab active:cursor-grabbing touch-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
    )}

    <div className="flex-1 min-w-0 space-y-2.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-foreground truncate flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground/70 flex-shrink-0" />
            {deal.empresa}
          </p>
          {deal.leads?.name && (
            <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
              {deal.leads.name}
            </p>
          )}
        </div>
        <div
          className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0"
          title={deal.profiles?.name || deal.profiles?.email || "Sem responsável"}
        >
          {deal.profiles ? (
            <span className="text-[10px] font-bold text-primary">
              {getInitials(deal.profiles.name, deal.profiles.email)}
            </span>
          ) : (
            <User className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
        <Calendar className="h-3 w-3" />
        <span>{format(new Date(deal.data_reuniao), "dd MMM yyyy, HH:mm", { locale: ptBR })}</span>
      </div>

      {/* Bottom: value + badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompareceu?.(deal.id, deal.compareceu);
            }}
            className="inline-flex"
          >
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 h-5 cursor-pointer transition-all duration-200",
                deal.compareceu
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-transparent text-muted-foreground/50 border-border/50 hover:border-border"
              )}
            >
              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
              Presente
            </Badge>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePix?.(deal.id, deal.pix_compromisso);
            }}
            className="inline-flex"
          >
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 h-5 cursor-pointer transition-all duration-200",
                deal.pix_compromisso
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-transparent text-muted-foreground/50 border-border/50 hover:border-border"
              )}
            >
              <BanknoteIcon className="h-2.5 w-2.5 mr-0.5" />
              PIX
            </Badge>
          </button>
        </div>

        {deal.valor_negocio > 0 && (
          <span className="text-xs font-semibold text-primary/80 whitespace-nowrap">
            {formatCurrency(Number(deal.valor_negocio))}
          </span>
        )}
      </div>
    </div>
  </div>
);

// ─── DragOverlay card (rendered outside list, follows mouse) ──────────────
export const DragOverlayCard = ({ deal }: { deal: DealWithRelations }) => (
  <div
    className={cn(
      "rounded-xl border bg-card p-4 shadow-2xl",
      "transform scale-105 rotate-2",
      "ring-2 ring-primary/30"
    )}
    style={{ zIndex: 9999, width: "100%", maxWidth: 340 }}
  >
    <CardInternals deal={deal} showHandle={false} />
  </div>
);

// ─── Sortable card (in-list, shows ghost when dragging) ───────────────────
interface BusinessCardProps {
  deal: DealWithRelations;
  onCardClick: (deal: DealWithRelations) => void;
  onToggleCompareceu: (dealId: string, current: boolean) => void;
  onTogglePix: (dealId: string, current: boolean) => void;
}

export const BusinessCard = ({
  deal,
  onCardClick,
  onToggleCompareceu,
  onTogglePix,
}: BusinessCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // ── Ghost placeholder when this card is being dragged ──
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-xl border-2 border-dashed border-border/40 bg-muted/10 min-h-[100px]"
      />
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout="position"
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "group relative rounded-xl border bg-card p-4 cursor-pointer",
        "transition-shadow duration-200",
        "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
        "hover:border-primary/20"
      )}
      onClick={() => onCardClick(deal)}
    >
      <CardInternals
        deal={deal}
        showHandle
        handleProps={{ ...attributes, ...listeners }}
        onToggleCompareceu={onToggleCompareceu}
        onTogglePix={onTogglePix}
      />
    </motion.div>
  );
};
