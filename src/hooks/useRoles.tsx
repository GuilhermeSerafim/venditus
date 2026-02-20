import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "comercial" | "financeiro" | "auditor";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  comercial: "Comercial",
  financeiro: "Financeiro",
  auditor: "Auditor",
};

export const ALL_ROLES: AppRole[] = ["admin", "comercial", "financeiro", "auditor"];

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

  // Menu permissions
  const canAccessLeads = isAdmin || hasRole("comercial");
  const canAccessSales = isAdmin || hasAnyRole(["comercial", "financeiro"]);
  const canAccessCashFlow = isAdmin || hasRole("financeiro");
  const canAccessEvents = isAdmin || hasRole("comercial");
  const canAccessProducts = isAdmin || hasRole("comercial");
  const canAccessExport = isAdmin || hasRole("financeiro");
  const canAccessUserManagement = isAdmin;
  const canAccessBusinessDesk = isAdmin || hasAnyRole(["comercial", "financeiro"]);
  
  // Edit permissions
  const canEditLeads = isAdmin || hasRole("comercial");
  const canEditSales = isAdmin || hasRole("comercial");
  const canEditCashFlow = isAdmin || hasRole("financeiro");
  const canEditEvents = isAdmin || hasRole("comercial");
  const canEditProducts = isAdmin || hasRole("comercial");

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
    canAccessBusinessDesk,
    canEditLeads,
    canEditSales,
    canEditCashFlow,
    canEditEvents,
    canEditProducts,
    isLoading,
  };
};
