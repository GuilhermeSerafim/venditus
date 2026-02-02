import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import { EditProductDialog } from "./EditProductDialog";
import { SortableTableHead } from "./SortableTableHead";
import { useRoles } from "@/hooks/useRoles";
import { useToast } from "@/hooks/use-toast";

export const ProductsTable = () => {
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const { canEditProducts } = useRoles();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Produto excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir produto", variant: "destructive" });
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

  const sortedProducts = useMemo(() => {
    if (!products || !sort) return products;

    return [...products].sort((a, b) => {
      let aVal = a[sort.key];
      let bVal = b[sort.key];

      if (sort.key === "price") {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      }

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, sort]);

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gold">Produtos</h2>
        {canEditProducts && (
          <Button onClick={() => setIsAdding(true)} className="bg-gold text-black hover:bg-gold/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <SortableTableHead label="Nome" sortKey="name" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Descrição" sortKey="description" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Preço" sortKey="price" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Ações" sortKey="" currentSort={null} onSort={() => {}} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts?.map((product) => (
              <TableRow key={product.id} className="border-border">
                <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.description || "-"}</TableCell>
                <TableCell className="text-gold font-medium">
                  {product.price ? `R$ ${Number(product.price).toLocaleString()}` : "-"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {canEditProducts && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingProduct(product)}
                        className="text-gold hover:text-gold hover:bg-gold/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(product.id)}
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

      {(editingProduct || isAdding) && (
        <EditProductDialog
          product={editingProduct}
          open={!!(editingProduct || isAdding)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingProduct(null);
              setIsAdding(false);
            }
          }}
        />
      )}
    </>
  );
};
