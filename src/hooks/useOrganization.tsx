import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ThemeConfig {
  primaryColor: string;
  logoUrl: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  theme_config: ThemeConfig;
  created_at: string;
  updated_at: string;
}

export const useOrganization = () => {
  return useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const { data: profile, error: profileError } = await (supabase
        .from("profiles") as any)
        .select("organization_id")
        .single();

      if (profileError) {
        // If profile fetch fails, user might not be logged in or other issue
        return null;
      }

      if (!profile?.organization_id) return null;

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", (profile as any).organization_id)
        .single();

      if (error) {
        console.error("Error fetching organization:", error);
        return null;
      }

      return data as unknown as Organization;
    },
    // Only run if we have a user, handled by caller or simple retry logic
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
