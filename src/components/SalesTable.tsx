import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import { EditSaleDialog } from "./EditSaleDialog";
import { SaleDetailsDialog } from "./SaleDetailsDialog";
import { SortableTableHead } from "./SortableTableHead";
import { useRoles } from "@/hooks/useRoles";
import { useToast } from "@/hooks/use-toast";

export const SalesTable = () => {
  const [editingSale, setEditingSale] = useState<any>(null);
  const [viewingSale, setViewingSale] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const { canEditSales } = useRoles();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, leads(name), products(name)")
        .order("sale_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({ title: "Venda excluída com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir venda", variant: "destructive" });
    },
  });

  const handleSort = (key: string) => {
    setSort((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedSales = useMemo(() => {
    if (!sales || !sort) return sales;

    return [...sales].sort((a, b) => {
      let aVal = a[sort.key];
      let bVal = b[sort.key];

      if (sort.key === "sale_date") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sort.key === "sold_value" || sort.key === "net_value") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [sales, sort]);

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gold">Vendas</h2>
        {canEditSales && (
          <Button onClick={() => setIsAdding(true)} className="bg-gold text-black hover:bg-gold/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <SortableTableHead label="Cliente" sortKey="leads.name" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Produto" sortKey="products.name" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Data" sortKey="sale_date" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Vendido" sortKey="sold_value" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Líquido" sortKey="net_value" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Status" sortKey="payment_status" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Ações" sortKey="" currentSort={null} onSort={() => {}} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSales?.map((sale) => (
              <TableRow key={sale.id} className="border-border">
                <TableCell className="font-medium text-foreground">{sale.leads?.name}</TableCell>
                <TableCell className="text-muted-foreground">{sale.products?.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(sale.sale_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-gold font-medium">
                  R$ {Number(sale.sold_value).toLocaleString()}
                </TableCell>
                <TableCell className="text-green-500 font-medium">
                  R$ {Number(sale.net_value).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className={sale.payment_status === "paid" ? "bg-green-500/10 text-green-500" : "bg-gold/10 text-gold"}>
                    {sale.payment_status === "paid" ? "Pago" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewingSale(sale)}
                    className="text-blue-500 hover:text-blue-500 hover:bg-blue-500/10"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canEditSales && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingSale(sale)}
                        className="text-gold hover:text-gold hover:bg-gold/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(sale.id)}
                        className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {(editingSale || isAdding) && (
        <EditSaleDialog
          sale={editingSale}
          open={!!(editingSale || isAdding)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSale(null);
              setIsAdding(false);
            }
          }}
        />
      )}

      {viewingSale && (
        <SaleDetailsDialog
          sale={viewingSale}
          open={!!viewingSale}
          onOpenChange={(open) => {
            if (!open) setViewingSale(null);
          }}
        />
      )}
    </>
  );
};
