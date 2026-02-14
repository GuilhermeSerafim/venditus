import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface OrgMember {
  id: string; // profile PK
  user_id: string; // auth.users.id — use this for FK references
  name: string | null;
  email: string;
}

export const useOrganizationMembers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["organization_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, name, email")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as OrgMember[];
    },
    enabled: !!user,
  });
};
