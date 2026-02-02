import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { LeadsTable } from "@/components/LeadsTable";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";

const Leads = () => {
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const { canEditLeads } = useRoles();

  return (
    <AppLayout 
      title="Gestão de Leads" 
      description="Gerencie todos os seus leads e contatos"
      actions={
        canEditLeads && (
          <Button
            onClick={() => setAddLeadOpen(true)}
            variant="gold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Lead
          </Button>
        )
      }
    >
      <LeadsTable />
      <AddLeadDialog open={addLeadOpen} onOpenChange={setAddLeadOpen} />
    </AppLayout>
  );
};

export default Leads;