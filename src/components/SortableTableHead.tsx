import { TableHead } from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableTableHeadProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: "asc" | "desc" } | null;
  onSort: (key: string) => void;
  className?: string;
}

export const SortableTableHead = ({
  label,
  sortKey,
  currentSort,
  onSort,
  className,
}: SortableTableHeadProps) => {
  const isSorted = currentSort?.key === sortKey;
  
  return (
    <TableHead className={cn("cursor-pointer select-none", className)} onClick={() => onSort(sortKey)}>
      <div className="flex items-center gap-2">
        {label}
        {!isSorted && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
        {isSorted && currentSort.direction === "asc" && <ArrowUp className="h-4 w-4 text-gold" />}
        {isSorted && currentSort.direction === "desc" && <ArrowDown className="h-4 w-4 text-gold" />}
      </div>
    </TableHead>
  );
};
