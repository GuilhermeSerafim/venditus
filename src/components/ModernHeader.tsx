import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRoles } from "@/hooks/useRoles";
import privateConsultancyLogo from "@/assets/private-consultancy-logo.png";

interface ModernHeaderProps {
  // Props removed - buttons now in individual pages
}

export const ModernHeader = ({}: ModernHeaderProps) => {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { canAccessUserManagement } = useRoles();

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group transition-all duration-200"
        >
          <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-gold to-gold-light p-0.5 shadow-md group-hover:shadow-gold transition-all duration-300 overflow-hidden">
            <img 
              src={privateConsultancyLogo} 
              alt="Private Consultancy" 
              className="h-full w-full object-cover rounded-xl"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground tracking-tight">Private Consultancy</span>
            <span className="text-[10px] text-muted-foreground leading-none">Sistema de Gestão</span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 rounded-full hover:bg-secondary/80 transition-all duration-300"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
            ) : (
              <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-90" />
            )}
          </Button>

          {canAccessUserManagement && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-9 w-9 p-0 rounded-full hover:bg-secondary/80 transition-all duration-300"
            >
              <Link to="/usuarios" aria-label="Configurações de usuários">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 border-l">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">{user?.email?.split('@')[0]}</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-gold/30 transition-all">
              <AvatarFallback className="bg-gradient-to-br from-gold/20 to-gold-light/20 text-gold font-semibold text-sm">
                {user?.email ? getInitials(user.email) : "U"}
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};