import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, Wallet, TrendingUp, Package, Calendar, Users, FileText, UserCog } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";

export const ModernNavBar = () => {
  const { canAccessLeads, canAccessSales, canAccessCashFlow, canAccessEvents, canAccessProducts, canAccessExport, canAccessUserManagement } = useRoles();

  return (
    <nav className="border-b border-border bg-card/60 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-1 py-2 overflow-x-auto">
          <NavLink 
            to="/" 
            end
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-secondary/60"
            activeClassName="bg-gradient-to-r from-gold/10 to-gold-light/10 text-gold shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>
          
          {canAccessCashFlow && (
            <NavLink 
              to="/caixa"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-secondary/60"
              activeClassName="bg-gradient-to-r from-gold/10 to-gold-light/10 text-gold shadow-sm"
            >
              <Wallet className="h-4 w-4" />
              <span>Caixa</span>
            </NavLink>
          )}
          
          {canAccessSales && (
            <NavLink 
              to="/vendas"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-secondary/60"
              activeClassName="bg-gradient-to-r from-gold/10 to-gold-light/10 text-gold shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Vendas</span>
            </NavLink>
          )}
          
          {canAccessLeads && (
            <NavLink 
              to="/leads"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-secondary/60"
              activeClassName="bg-gradient-to-r from-gold/10 to-gold-light/10 text-gold shadow-sm"
            >
              <Users className="h-4 w-4" />
              <span>Leads</span>
            </NavLink>
          )}
          
          {canAccessEvents && (
            <NavLink 
              to="/eventos"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-secondary/60"
              activeClassName="bg-gradient-to-r from-gold/10 to-gold-light/10 text-gold shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              <span>Eventos</span>
            </NavLink>
          )}
          
          {canAccessProducts && (
            <NavLink 
              to="/produtos"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-secondary/60"
              activeClassName="bg-gradient-to-r from-gold/10 to-gold-light/10 text-gold shadow-sm"
            >
              <Package className="h-4 w-4" />
              <span>Produtos</span>
            </NavLink>
          )}
          
          {canAccessExport && (
            <NavLink 
              to="/exportar"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-secondary/60"
              activeClassName="bg-gradient-to-r from-gold/10 to-gold-light/10 text-gold shadow-sm"
            >
              <FileText className="h-4 w-4" />
              <span>Exportar</span>
            </NavLink>
          )}
          
          {canAccessUserManagement && (
            <NavLink 
              to="/usuarios"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-secondary/60"
              activeClassName="bg-gradient-to-r from-gold/10 to-gold-light/10 text-gold shadow-sm"
            >
              <UserCog className="h-4 w-4" />
              <span>Usuários</span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};