import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ModernCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
  children?: ReactNode;
}

export const ModernCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  iconColor = "text-gold",
  iconBgColor = "bg-gold/10",
  children,
}: ModernCardProps) => {
  return (
    <Card className="group bg-card border border-border hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-default">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl ${iconBgColor} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? 'text-success' : 'text-error'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
};
