import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface HeaderProps {
  onAddLead: () => void;
  onAddEvent: () => void;
}

export const Header = ({ onAddLead, onAddEvent }: HeaderProps) => {
  const { signOut, user } = useAuth();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
            <img 
              src="/logo-seven.png" 
              alt="Seven Logo" 
              className="h-14 w-14 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gold">Seven</h1>
              <p className="text-sm text-muted-foreground">Meu negócio na minha mão</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground mr-2">{user?.email}</span>
            <Button
              onClick={onAddLead}
              variant="outline"
              size="sm"
              className="border-gold text-gold hover:bg-gold hover:text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
            <Button
              onClick={onAddEvent}
              size="sm"
              className="bg-gold text-primary-foreground hover:bg-gold-dark"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-gold"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
