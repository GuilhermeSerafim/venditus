import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
}

export const MetricCard = ({ title, value, icon, trend }: MetricCardProps) => {
  return (
    <Card className={cn(
      "premium-card group cursor-default",
      "border-border/50 dark:border-gold/5 dark:bg-gradient-to-br dark:from-card dark:to-card/80"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-lg bg-gold/10 text-gold transition-transform duration-200",
          "group-hover:scale-110"
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="metric-number text-gold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-2">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
};