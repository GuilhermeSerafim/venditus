import { AppLayout } from "@/components/AppLayout";
import { ProductsTable } from "@/components/ProductsTable";

const Products = () => {
  return (
    <AppLayout 
      title="Gestão de Produtos" 
      description="Gerencie seu catálogo de produtos"
    >
      <ProductsTable />
    </AppLayout>
  );
};

export default Products;