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
  Menu,
  X,
  LifeBuoy,
  Handshake,
  Settings
} from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import venditusLogo from "@/assets/venditus-logo.png";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const MobileNavItem = ({ to, icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
        isActive 
          ? "bg-gold/10 text-gold" 
          : "text-foreground/70 hover:bg-secondary hover:text-foreground"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gold rounded-r-full" />
      )}
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
};

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { 
    canAccessLeads, 
    canAccessSales, 
    canAccessCashFlow, 
    canAccessEvents, 
    canAccessProducts, 
    canAccessExport, 
    canAccessExport,
    canAccessUserManagement,
    canAccessBusinessDesk
  } = useRoles();

  const navItems = [
    { to: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", show: true },
    { to: "/caixa", icon: <Wallet className="h-5 w-5" />, label: "Caixa", show: canAccessCashFlow },
    { to: "/vendas", icon: <TrendingUp className="h-5 w-5" />, label: "Vendas", show: canAccessSales },
    { to: "/leads", icon: <Users className="h-5 w-5" />, label: "Leads", show: canAccessLeads },
    { to: "/eventos", icon: <Calendar className="h-5 w-5" />, label: "Eventos", show: canAccessEvents },
    { to: "/produtos", icon: <Package className="h-5 w-5" />, label: "Produtos", show: canAccessProducts },
    { to: "/mesa-de-negocios", icon: <Handshake className="h-5 w-5" />, label: "Mesa de Negócios", show: canAccessBusinessDesk },
    { to: "/exportar", icon: <FileText className="h-5 w-5" />, label: "Exportar", show: canAccessExport },
    { to: "/usuarios", icon: <UserCog className="h-5 w-5" />, label: "Usuários", show: canAccessUserManagement },
    { to: "/configuracoes", icon: <Settings className="h-5 w-5" />, label: "Configurações", show: canAccessUserManagement },
    { to: "/suporte", icon: <LifeBuoy className="h-5 w-5" />, label: "Suporte", show: true },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="md:hidden h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="border-b border-border px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-gold/20">
                <img 
                  src={venditusLogo} 
                  alt="Venditus" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <SheetTitle className="text-base font-semibold text-foreground">
                  Venditus
                </SheetTitle>
                <span className="text-xs text-muted-foreground">
                  Sistema de Gestão
                </span>
              </div>
            </div>
          </SheetHeader>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.filter(item => item.show).map((item) => (
              <MobileNavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};
