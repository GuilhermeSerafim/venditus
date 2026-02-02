import { AppLayout } from "@/components/AppLayout";
import { SalesTable } from "@/components/SalesTable";

const Sales = () => {
  return (
    <AppLayout 
      title="Gestão de Vendas" 
      description="Acompanhe todas as suas vendas e pagamentos"
    >
      <SalesTable />
    </AppLayout>
  );
};

export default Sales;