import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { EventsTable } from "@/components/EventsTable";
import { AddEventDialog } from "@/components/AddEventDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";

const Events = () => {
  const [addEventOpen, setAddEventOpen] = useState(false);
  const { canEditEvents } = useRoles();

  return (
    <AppLayout 
      title="Gestão de Eventos" 
      description="Organize e acompanhe seus eventos"
      actions={
        canEditEvents && (
          <Button
            onClick={() => setAddEventOpen(true)}
            variant="gold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        )
      }
    >
      <EventsTable />
      {canEditEvents && <AddEventDialog open={addEventOpen} onOpenChange={setAddEventOpen} />}
    </AppLayout>
  );
};

export default Events;