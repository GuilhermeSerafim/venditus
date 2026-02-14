import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Users, 
  Calendar, 
  Package, 
  FileText, 
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  Handshake
} from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useOrganization } from "@/hooks/useOrganization";
import { cn } from "@/lib/utils";
import venditusLogo from "@/assets/venditus-logo.png";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isCollapsed, isActive }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
        isActive 
          ? "bg-sidebar-accent text-gold" 
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        isCollapsed && "justify-center px-2"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gold rounded-r-full" />
      )}
      <span className={cn(
        "flex-shrink-0 transition-transform duration-200",
        "group-hover:scale-105 group-active:scale-95"
      )}>
        {icon}
      </span>
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
    </NavLink>
  );
};

export const AppSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const { data: org } = useOrganization();
  const { 
    canAccessLeads, 
    canAccessSales, 
    canAccessCashFlow, 
    canAccessEvents, 
    canAccessProducts, 
    canAccessExport, 
    canAccessUserManagement 
  } = useRoles();

  const navItems = [
    { to: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", show: true },
    { to: "/caixa", icon: <Wallet className="h-5 w-5" />, label: "Caixa", show: canAccessCashFlow },
    { to: "/vendas", icon: <TrendingUp className="h-5 w-5" />, label: "Vendas", show: canAccessSales },
    { to: "/leads", icon: <Users className="h-5 w-5" />, label: "Leads", show: canAccessLeads },
    { to: "/eventos", icon: <Calendar className="h-5 w-5" />, label: "Eventos", show: canAccessEvents },
    { to: "/produtos", icon: <Package className="h-5 w-5" />, label: "Produtos", show: canAccessProducts },
    { to: "/mesa-de-negocios", icon: <Handshake className="h-5 w-5" />, label: "Mesa de Negócios", show: true },
    { to: "/exportar", icon: <FileText className="h-5 w-5" />, label: "Exportar", show: canAccessExport },
    { to: "/usuarios", icon: <UserCog className="h-5 w-5" />, label: "Usuários", show: canAccessUserManagement },
    { to: "/configuracoes", icon: <Settings className="h-5 w-5" />, label: "Configurações", show: canAccessUserManagement }, // Admin only usually
    { to: "/suporte", icon: <LifeBuoy className="h-5 w-5" />, label: "Suporte", show: true },
  ];

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={cn(
        "hidden md:flex fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex-col",
        isCollapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        isCollapsed && "justify-center px-2"
      )}>
        {org?.theme_config?.logoUrl ? (
          // Organization Logo
          <div className={cn(
            "flex items-center gap-3 overflow-hidden",
            isCollapsed && "justify-center"
          )}>
            <div className="h-9 flex-shrink-0">
              <img 
                src={org.theme_config.logoUrl} 
                alt={org.name}
                className="h-full w-auto object-contain"
              />
            </div>
            {!isCollapsed && org.name && (
              <span className="font-display font-bold text-sm text-foreground truncate">
                {org.name}
              </span>
            )}
          </div>
        ) : (
          // Default Venditus Logo
          <>
            <div className="h-9 w-9 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-gold/20">
              <img 
                src={venditusLogo} 
                alt="Venditus" 
                className="h-full w-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-sidebar-foreground truncate">
                  Venditus
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  Sistema de Gestão
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.filter(item => item.show).map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isCollapsed={isCollapsed}
            isActive={location.pathname === item.to || (item.to === "/" && location.pathname === "/")}
          />
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground",
            "hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
            isCollapsed && "justify-center px-2"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};