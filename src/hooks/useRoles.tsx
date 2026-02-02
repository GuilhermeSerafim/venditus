import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "comercial" | "financeiro" | "somente_leitura";

interface UserRole {
  role: AppRole;
}

export const useRoles = () => {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching roles:", error);
        throw error;
      }
      return (data || []) as UserRole[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const userRoles = roles.map((r) => r.role);

  const hasRole = (role: AppRole) => userRoles.includes(role);

  const hasAnyRole = (roleList: AppRole[]) => 
    roleList.some((role) => userRoles.includes(role));

  const isAdmin = hasRole("admin");

  // Menu permissions - somente_leitura can view all menus
  const canAccessLeads = isAdmin || hasAnyRole(["comercial", "somente_leitura"]);
  const canAccessSales = isAdmin || hasAnyRole(["comercial", "financeiro", "somente_leitura"]);
  const canAccessCashFlow = isAdmin || hasAnyRole(["financeiro", "somente_leitura"]);
  const canAccessEvents = isAdmin || hasAnyRole(["comercial", "somente_leitura"]);
  const canAccessProducts = isAdmin || hasAnyRole(["comercial", "somente_leitura"]);
  const canAccessExport = isAdmin || hasAnyRole(["financeiro", "somente_leitura"]);
  const canAccessUserManagement = isAdmin;
  
  // Edit permissions
  const canEditLeads = isAdmin || hasAnyRole(["comercial"]);
  const canEditSales = isAdmin || hasAnyRole(["comercial", "financeiro"]);
  const canEditCashFlow = isAdmin || hasAnyRole(["financeiro"]);
  const canEditEvents = isAdmin || hasAnyRole(["comercial"]);
  const canEditProducts = isAdmin || hasAnyRole(["comercial"]);

  return {
    roles: userRoles,
    hasRole,
    hasAnyRole,
    isAdmin,
    canAccessLeads,
    canAccessSales,
    canAccessCashFlow,
    canAccessEvents,
    canAccessProducts,
    canAccessExport,
    canAccessUserManagement,
    canEditLeads,
    canEditSales,
    canEditCashFlow,
    canEditEvents,
    canEditProducts,
    isLoading,
  };
};
