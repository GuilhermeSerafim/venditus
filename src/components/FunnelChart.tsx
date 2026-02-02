import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface FunnelChartProps {
  data: {
    leads: number;
    confirmed: number;
    attended: number;
    negotiation: number;
    purchased: number;
  };
  rates: {
    confirmationRate: number;
    attendanceRate: number;
    negotiationRate: number;
    closingRate: number;
  };
}

export const FunnelChart = ({ data, rates }: FunnelChartProps) => {
  const stages = [
    { label: "Leads Gerados", value: data.leads, width: 100, rate: null },
    { label: "Confirmados", value: data.confirmed, width: 80, rate: rates.confirmationRate },
    { label: "Compareceram", value: data.attended, width: 60, rate: rates.attendanceRate },
    { label: "Em Negociação", value: data.negotiation, width: 40, rate: rates.negotiationRate },
    { label: "Compraram", value: data.purchased, width: 20, rate: rates.closingRate },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-gold">Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stages.map((stage, index) => (
          <div key={stage.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">{stage.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-gold font-bold">{stage.value}</span>
                {stage.rate !== null && (
                  <span className="text-muted-foreground text-xs">
                    ({stage.rate.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
            <div className="relative h-12 bg-secondary rounded-lg overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-gold-light flex items-center justify-center text-primary-foreground font-semibold transition-all duration-500"
                style={{ width: `${stage.width}%` }}
              >
                {stage.value > 0 && stage.value}
              </div>
            </div>
            {index < stages.length - 1 && (
              <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 text-gold" />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
