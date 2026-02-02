import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, Wallet, TrendingUp, Package, Calendar, Users, FileText } from "lucide-react";

export const NavBar = () => {
  return (
    <nav className="border-b border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-6 py-3">
          <NavLink to="/" end>
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/caixa">
            <Wallet className="h-4 w-4" />
            <span>Caixa</span>
          </NavLink>
          <NavLink to="/vendas">
            <TrendingUp className="h-4 w-4" />
            <span>Vendas</span>
          </NavLink>
          <NavLink to="/leads">
            <Users className="h-4 w-4" />
            <span>Leads</span>
          </NavLink>
          <NavLink to="/eventos">
            <Calendar className="h-4 w-4" />
            <span>Eventos</span>
          </NavLink>
          <NavLink to="/produtos">
            <Package className="h-4 w-4" />
            <span>Produtos</span>
          </NavLink>
          <NavLink to="/exportar">
            <FileText className="h-4 w-4" />
            <span>Exportar</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
