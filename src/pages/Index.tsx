import { AppLayout } from "@/components/AppLayout";
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";

const Index = () => {
  return (
    <AppLayout 
      title="Dashboard Executivo" 
      description="Visão geral do seu negócio em tempo real"
    >
      <ExecutiveDashboard />
    </AppLayout>
  );
};

export default Index;