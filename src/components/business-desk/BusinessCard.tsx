import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  } = useSortable({ id: deal.id, data: { deal } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative rounded-xl border bg-card p-4 cursor-pointer",
        "transition-shadow duration-200",
        "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
        "hover:border-primary/20",
        isDragging && "opacity-40 shadow-2xl ring-2 ring-primary/30 z-50 scale-[1.02]"
      )}
      onClick={() => !isDragging && onCardClick(deal)}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50",
          "cursor-grab active:cursor-grabbing touch-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <div className="pl-4 space-y-3">
        {/* Header: empresa + responsável */}
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
          {/* Avatar do responsável */}
          <div
            className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0"
            title={deal.profiles?.name || deal.profiles?.email || ""}
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
          {/* Badges */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompareceu(deal.id, deal.compareceu);
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
                onTogglePix(deal.id, deal.pix_compromisso);
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

          {/* Value */}
          {deal.valor_negocio > 0 && (
            <span className="text-xs font-semibold text-primary/80 whitespace-nowrap">
              {formatCurrency(Number(deal.valor_negocio))}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
