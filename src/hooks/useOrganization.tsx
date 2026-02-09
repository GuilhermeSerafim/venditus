import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor?: string;
  tertiaryColor?: string;
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
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      // 1. Get the organization ID directly via RPC (helper function)
      // This is faster and avoids the "multiple rows" error from filtering profiles manually
      const { data: orgId, error: orgIdError } = await supabase.rpc('get_auth_organization_id');

      if (orgIdError) {
        console.error("Error fetching org ID:", orgIdError);
        return null;
      }

      if (!orgId) return null;

      // 2. Fetch the organization details
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .single();

      if (error) {
        console.error("Error fetching organization:", error);
        return null;
      }

      return data as unknown as Organization;
    },
    enabled: !!user, // Only run when user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
