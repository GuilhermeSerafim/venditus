import { Card, Metric, Text, Flex, BadgeDelta, DeltaType, Icon } from "@tremor/react";

interface DashboardMetricCardProps {
  title: string;
  metric: string;
  metricClassName?: string;
  icon?: React.ElementType;
  diff?: number;
  diffType?: DeltaType;
  diffText?: string;
  color?: string;
}

export const DashboardMetricCard = ({
  title,
  metric,
  metricClassName,
  icon,
  diff,
  diffType,
  diffText,
  color,
}: DashboardMetricCardProps) => {
  return (
    <Card 
      className="max-w-xs mx-auto decoration-top decoration-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card to-card/80" 
      decorationColor={color}
    >
      <Flex justifyContent="between" alignItems="start">
        <div className="flex-1">
          <Text className="text-tremor-content-subtle dark:text-dark-tremor-content-subtle">{title}</Text>
          {diff !== undefined && (
            <BadgeDelta
              deltaType={diffType || "unchanged"}
              isIncreasePositive={true}
              size="xs"
              className="mt-2"
            >
              {diffText || `${diff}%`}
            </BadgeDelta>
          )}
        </div>
        {icon && (
          <Icon 
            icon={icon} 
            variant="light" 
            size="lg"
            color={color}
            className="animate-fade-in"
          />
        )}
      </Flex>
      <Metric className={`mt-4 font-bold ${metricClassName}`}>{metric}</Metric>
    </Card>
  );
};
