import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { UserScore } from "@/types/social-selling";

export interface LeaderboardEntry {
  user_id: string;
  total_score: number;
  name: string | null;
  email: string;
}

export const useGamification = () => {
  const { user } = useAuth();

  const scoresQuery = useQuery({
    queryKey: ["user_scores"],
    queryFn: async () => {
      // Fetch all scores
      const { data: scores, error } = await supabase
        .from("user_scores")
        .select("*")
        .order("total_score", { ascending: false });

      if (error) throw error;

      // Fetch profiles for the scored users
      const userIds = (scores || []).map((s) => s.user_id);
      let profilesMap: Record<string, { name: string | null; email: string }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds);

        (profiles || []).forEach((p) => {
          profilesMap[p.id] = { name: p.name, email: p.email };
        });
      }

      const leaderboard: LeaderboardEntry[] = (scores || []).map((s) => ({
        user_id: s.user_id,
        total_score: s.total_score,
        name: profilesMap[s.user_id]?.name || null,
        email: profilesMap[s.user_id]?.email || "—",
      }));

      const myScore = user
        ? leaderboard.find((e) => e.user_id === user.id)?.total_score ?? 0
        : 0;

      const myRank = user
        ? leaderboard.findIndex((e) => e.user_id === user.id) + 1
        : 0;

      return { leaderboard, myScore, myRank };
    },
    enabled: !!user,
  });

  return {
    leaderboard: scoresQuery.data?.leaderboard ?? [],
    myScore: scoresQuery.data?.myScore ?? 0,
    myRank: scoresQuery.data?.myRank ?? 0,
    isLoading: scoresQuery.isLoading,
  };
};
