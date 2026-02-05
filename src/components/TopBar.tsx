import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, Bell, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

export const TopBar = () => {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full h-14 md:h-16 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="h-full flex items-center justify-between px-3 md:px-6 gap-1 md:gap-2">
        {/* Mobile Navigation */}
        <MobileNav />
        
        {/* Right side actions */}
        <div className="flex items-center gap-1 md:gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
        >
          {theme === "light" ? (
            <Moon className="h-[18px] w-[18px]" />
          ) : (
            <Sun className="h-[18px] w-[18px]" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
        >
          <Bell className="h-[18px] w-[18px]" />
        </Button>

        {/* Divider */}
        <div className="hidden md:block h-6 w-px bg-border mx-2" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground leading-tight">
              {user?.email?.split('@')[0]}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {user?.email}
            </span>
          </div>
          
          <Avatar className={cn(
            "h-9 w-9 ring-2 ring-gold/30 transition-all duration-200",
            "hover:ring-gold/50"
          )}>
            <AvatarFallback className="bg-gradient-to-br from-gold/20 to-gold-light/20 text-gold font-semibold text-sm">
              {user?.email ? getInitials(user.email) : "U"}
            </AvatarFallback>
          </Avatar>

          <Button
            onClick={signOut}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </Button>
        </div>
        </div>
      </div>
    </header>
  );
};