import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { EditEventDialog } from "./EditEventDialog";
import { EventDetailsDialog } from "./EventDetailsDialog";
import { SortableTableHead } from "./SortableTableHead";
import { TablePagination } from "./TablePagination";
import { useRoles } from "@/hooks/useRoles";
import { useToast } from "@/hooks/use-toast";

export const EventsTable = () => {
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [viewingEvent, setViewingEvent] = useState<any>(null);
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { canEditEvents } = useRoles();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Evento excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir evento", variant: "destructive" });
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

  const sortedEvents = useMemo(() => {
    if (!events || !sort) return events;

    return [...events].sort((a, b) => {
      let aVal = a[sort.key];
      let bVal = b[sort.key];

      if (sort.key === "event_date") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [events, sort]);

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEvents = sortedEvents?.slice(startIndex, endIndex) || [];

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
              <SortableTableHead label="Nome" sortKey="name" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Data" sortKey="event_date" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Local" sortKey="location" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Capacidade" sortKey="capacity" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Leads" sortKey="leads_count" currentSort={sort} onSort={handleSort} />
              <SortableTableHead label="Ações" sortKey="" currentSort={null} onSort={() => {}} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.map((event) => (
              <TableRow key={event.id} className="border-border">
                <TableCell className="font-medium text-foreground">{event.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(event.event_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground">{event.location || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{event.capacity || "-"}</TableCell>
                <TableCell className="text-gold">{event.leads_count || 0}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setViewingEvent(event)}
                  className="text-blue-500 hover:text-blue-500 hover:bg-blue-500/10"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canEditEvents && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingEvent(event)}
                      className="text-gold hover:text-gold hover:bg-gold/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(event.id)}
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
        <TablePagination
          currentPage={currentPage}
          totalItems={sortedEvents?.length || 0}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
        />
      )}

      {viewingEvent && (
        <EventDetailsDialog
          event={viewingEvent}
          open={!!viewingEvent}
          onOpenChange={(open) => {
            if (!open) setViewingEvent(null);
          }}
        />
      )}
    </>
  );
};
