import { Card, Metric, Text, Flex, BadgeDelta, DeltaType } from "@tremor/react";

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
  diff,
  diffType,
  diffText,
  color,
}: DashboardMetricCardProps) => {
  return (
    <Card className="max-w-xs mx-auto decoration-top decoration-4" decorationColor={color}>
      <Flex justifyContent="between" alignItems="center">
        <Text>{title}</Text>
        {diff !== undefined && (
          <BadgeDelta
            deltaType={diffType || "unchanged"}
            isIncreasePositive={true}
            size="xs"
          >
            {diffText || `${diff}%`}
          </BadgeDelta>
        )}
      </Flex>
      <Metric className={metricClassName}>{metric}</Metric>
    </Card>
  );
};
