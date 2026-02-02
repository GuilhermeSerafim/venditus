import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface Interaction {
  id: string;
  interaction_type: string;
  interaction_date: string;
  description: string;
  outcome?: string;
  next_action?: string;
  next_action_date?: string;
  created_by?: string;
}

interface InteractionsTimelineProps {
  interactions: Interaction[];
}

export const InteractionsTimeline = ({ interactions }: InteractionsTimelineProps) => {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      call: "bg-blue-500/10 text-blue-500",
      meeting: "bg-purple-500/10 text-purple-500",
      email: "bg-green-500/10 text-green-500",
      whatsapp: "bg-emerald-500/10 text-emerald-500",
      note: "bg-gold/10 text-gold",
    };
    return colors[type] || colors.note;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      call: "Ligação",
      meeting: "Reunião",
      email: "E-mail",
      whatsapp: "WhatsApp",
      note: "Nota",
    };
    return labels[type] || type;
  };

  if (!interactions.length) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhuma interação registrada
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction, index) => (
        <Card key={interaction.id} className="border-border bg-background relative">
          {index !== interactions.length - 1 && (
            <div className="absolute left-6 top-16 bottom-0 w-px bg-border" />
          )}
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-gold z-10" />
                <Badge className={getTypeColor(interaction.interaction_type)}>
                  {getTypeLabel(interaction.interaction_type)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(interaction.interaction_date).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 ml-6">
            <p className="text-foreground">{interaction.description}</p>
            {interaction.outcome && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Resultado:</span> {interaction.outcome}
                </p>
              </div>
            )}
            {interaction.next_action && (
              <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
                <p className="text-sm">
                  <span className="font-medium text-gold">Próxima ação:</span> {interaction.next_action}
                </p>
                {interaction.next_action_date && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(interaction.next_action_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
            {interaction.created_by && (
              <p className="text-xs text-muted-foreground">Por: {interaction.created_by}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
