import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { EditLeadDialog } from "./EditLeadDialog";
import { LeadDetailsDialog } from "./LeadDetailsDialog";
import { SortableTableHead } from "./SortableTableHead";
import { TablePagination } from "./TablePagination";
import { useRoles } from "@/hooks/useRoles";
import { useToast } from "@/hooks/use-toast";

export const LeadsTable = () => {
  const [editingLead, setEditingLead] = useState<any>(null);
  const [viewingLead, setViewingLead] = useState<any>(null);
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { canEditLeads } = useRoles();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      // Fetch leads with sales count to determine if they are customers
      const { data, error } = await supabase
        .from("leads")
        .select("*, sales(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir lead", variant: "destructive" });
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

  const sortedLeads = useMemo(() => {
    if (!leads || !sort) return leads;

    return [...leads].sort((a, b) => {
      let aVal = a[sort.key];
      let bVal = b[sort.key];

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [leads, sort]);

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLeads = sortedLeads?.slice(startIndex, endIndex) || [];

  // Reset to page 1 when sort changes
  useMemo(() => {
    setCurrentPage(1);
  }, [sort]);

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <SortableTableHead key="name" label="Nome" sortKey="name" currentSort={sort} onSort={handleSort} />
              <SortableTableHead key="email" label="Email" sortKey="email" currentSort={sort} onSort={handleSort} />
              <SortableTableHead key="phone" label="Telefone" sortKey="phone" currentSort={sort} onSort={handleSort} />
              <SortableTableHead key="lead_source" label="Origem" sortKey="lead_source" currentSort={sort} onSort={handleSort} />
              <SortableTableHead key="status" label="Status" sortKey="" currentSort={null} onSort={() => {}} />
              <SortableTableHead key="actions" label="Ações" sortKey="" currentSort={null} onSort={() => {}} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead, index) => {
              const isCustomer = lead.sales && lead.sales.length > 0;
              return (
              <TableRow key={lead.id || index} className="border-border">
                <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
                <TableCell className="text-muted-foreground">{lead.email || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{lead.phone || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{lead.lead_source || "-"}</TableCell>
                <TableCell>
                  {isCustomer ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Cliente
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Lead
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewingLead(lead)}
                    className="text-gold hover:text-gold hover:bg-gold/10"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canEditLeads && (
                    <>
                      <Button
                        key="edit-btn"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingLead(lead)}
                        className="text-gold hover:text-gold hover:bg-gold/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        key="delete-btn"
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(lead.id)}
                        className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          currentPage={currentPage}
          totalItems={sortedLeads?.length || 0}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {editingLead && (
        <EditLeadDialog
          lead={editingLead}
          open={!!editingLead}
          onOpenChange={(open) => !open && setEditingLead(null)}
        />
      )}

      {viewingLead && (
        <LeadDetailsDialog
          lead={viewingLead}
          open={!!viewingLead}
          onOpenChange={(open) => !open && setViewingLead(null)}
        />
      )}
    </>
  );
};