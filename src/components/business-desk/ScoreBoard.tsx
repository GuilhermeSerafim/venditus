import { Card, CardContent } from "@/components/ui/card";
import { useGamification } from "@/hooks/useGamification";
import { Trophy, Medal, Star, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />;
  return <Star className="h-3.5 w-3.5 text-muted-foreground" />;
};

const getRankBg = (rank: number) => {
  if (rank === 1) return "bg-yellow-500/10 border-yellow-500/30";
  if (rank === 2) return "bg-gray-400/10 border-gray-400/30";
  if (rank === 3) return "bg-amber-700/10 border-amber-700/30";
  return "bg-muted/30 border-border";
};

const getInitials = (name: string | null, email: string) => {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return email.substring(0, 2).toUpperCase();
};

export const ScoreBoard = () => {
  const { leaderboard, myScore, myRank, isLoading } = useGamification();

  if (isLoading) return null;

  const top5 = leaderboard.slice(0, 5);

  return (
    <Card className="border-border bg-card/50">
      <CardContent className="p-4 space-y-4">
        {/* My Score */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gold/10 border border-gold/20">
          <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">Minha Pontuação</p>
            <p className="text-xl font-bold text-gold">{myScore} pts</p>
          </div>
          {myRank > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Posição</p>
              <p className="text-lg font-bold text-foreground">#{myRank}</p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {top5.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              Ranking
            </p>
            <div className="space-y-1.5">
              {top5.map((entry, i) => (
                <div
                  key={entry.user_id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                    getRankBg(i + 1)
                  )}
                >
                  <span className="flex-shrink-0 w-5 flex justify-center">
                    {getRankIcon(i + 1)}
                  </span>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-muted font-medium">
                      {getInitials(entry.name, entry.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground truncate flex-1">
                    {entry.name || entry.email.split("@")[0]}
                  </span>
                  <span className="text-xs font-bold text-gold whitespace-nowrap">
                    {entry.total_score} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {top5.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Nenhuma pontuação registrada ainda
          </p>
        )}
      </CardContent>
    </Card>
  );
};
