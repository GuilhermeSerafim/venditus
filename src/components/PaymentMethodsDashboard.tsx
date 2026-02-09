import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DonutChart, BarChart, Legend } from "@tremor/react";
import { subMonths } from "date-fns";

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  pix: "emerald", // tremor-emerald-500
  boleto: "blue", // tremor-blue-500
  cartao_credito: "purple", // tremor-purple-500
  transferencia: "amber", // tremor-amber-500
  dinheiro: "red", // tremor-red-500
  parcelado: "teal", // tremor-teal-500
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: "Pix",
  boleto: "Boleto",
  cartao_credito: "Cartão de Crédito",
  transferencia: "Transferência",
  dinheiro: "Dinheiro",
  parcelado: "Parcelado",
};

export const PaymentMethodsDashboard = () => {
  const [period, setPeriod] = useState("all");
  const [productFilter, setProductFilter] = useState("all");

  const { data: sales } = useQuery({
    queryKey: ["sales-payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, products(id, name)")
        .order("sale_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  // Filter sales by period and product
  const filteredSales = sales?.filter((sale) => {
    let passesDateFilter = true;
    let passesProductFilter = true;

    // Date filter
    if (period !== "all") {
      const saleDate = new Date(sale.sale_date);
      const now = new Date();
      
      if (period === "1m") {
        passesDateFilter = saleDate >= subMonths(now, 1);
      } else if (period === "3m") {
        passesDateFilter = saleDate >= subMonths(now, 3);
      } else if (period === "6m") {
        passesDateFilter = saleDate >= subMonths(now, 6);
      } else if (period === "12m") {
        passesDateFilter = saleDate >= subMonths(now, 12);
      }
    }

    // Product filter
    if (productFilter !== "all") {
      passesProductFilter = sale.product_id === productFilter;
    }

    return passesDateFilter && passesProductFilter;
  }) || [];

  // Calculate payment method distribution
  const paymentMethodCounts: Record<string, number> = {};
  const paymentMethodValues: Record<string, number> = {};

  filteredSales.forEach((sale) => {
    const method = sale.payment_method || "pix";
    paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;
    paymentMethodValues[method] = (paymentMethodValues[method] || 0) + Number(sale.sold_value);
  });

  const donutChartData = Object.entries(paymentMethodCounts).map(([method, count]) => ({
    name: PAYMENT_METHOD_LABELS[method] || method,
    value: count,
  }));

  const barChartData = Object.entries(paymentMethodValues).map(([method, value]) => ({
    name: PAYMENT_METHOD_LABELS[method] || method,
    "Valor": value,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalSales = filteredSales.length;
  const totalValue = filteredSales.reduce((sum, sale) => sum + Number(sale.sold_value), 0);
  
  // Get colors array based on data keys
  const donutColors = Object.keys(paymentMethodCounts).map(method => PAYMENT_METHOD_COLORS[method] || "gray");

  return (
    <Card className="border-border bg-card shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-gold font-bold">Formas de Pagamento por Produto</CardTitle>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] bg-background border-border">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo período</SelectItem>
                <SelectItem value="1m">Último mês</SelectItem>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="12m">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[180px] bg-background border-border">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Donut Chart - Count */}
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
              Quantidade de Vendas ({totalSales} vendas)
            </h4>
            {donutChartData.length > 0 ? (
              <>
                <DonutChart
                  className="mt-6 h-80"
                  data={donutChartData}
                  category="value"
                  index="name"
                  colors={donutColors}
                  valueFormatter={(number) => `${number} vendas`}
                  variant="donut"
                  showAnimation={true}
                  showLabel={true}
                />
                <Legend
                  className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2"
                  categories={donutChartData.map((d) => d.name)}
                  colors={donutColors}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma venda encontrada
              </div>
            )}
          </div>

          {/* Bar Chart - Value */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
              Valor por Forma de Pagamento ({formatCurrency(totalValue)})
            </h4>
            {barChartData.length > 0 ? (
              <BarChart
                className="mt-6 h-80"
                data={barChartData}
                index="name"
                categories={["Valor"]}
                colors={["emerald"]} 
                valueFormatter={(number) => formatCurrency(number)}
                yAxisWidth={120}
                layout="vertical"
                showGridLines={false}
                showAnimation={true}
                animationDuration={800}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma venda encontrada
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};