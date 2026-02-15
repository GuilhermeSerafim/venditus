import * as React from "react";
import { Check, ChevronsUpDown, Shield, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { AppRole, ROLE_LABELS, ALL_ROLES } from "@/hooks/useRoles";

interface RoleMultiSelectProps {
  selectedRoles: AppRole[];
  onChange: (roles: AppRole[]) => void;
  disabled?: boolean;
}

export function RoleMultiSelect({
  selectedRoles,
  onChange,
  disabled = false,
}: RoleMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleRole = (role: AppRole) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];
    onChange(newRoles);
  };

  const getButtonText = () => {
    if (selectedRoles.length === 0) {
      return <span className="text-muted-foreground/70 font-normal">Selecione...</span>;
    }
    if (selectedRoles.length === 1) {
      return (
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
          {ROLE_LABELS[selectedRoles[0]]}
        </Badge>
      );
    }
    if (selectedRoles.length === 2) {
      return (
        <span className="text-sm font-medium">
          {selectedRoles.map((r) => ROLE_LABELS[r]).join(", ")}
        </span>
      );
    }
    return (
      <span className="text-sm font-medium flex items-center gap-1.5">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 h-5 px-1.5">
          {selectedRoles.length}
        </Badge>
        funções selecionadas
      </span>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-9 px-3 transition-all duration-200",
            "hover:bg-muted/50 hover:border-primary/30",
            "cursor-pointer active:scale-[0.98]",
            open && "border-primary ring-2 ring-primary/20"
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            <Shield className="h-4 w-4 text-muted-foreground/70" />
            {getButtonText()}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar função..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhuma função encontrada.</CommandEmpty>
            <CommandGroup heading="Funções Disponíveis">
              {ALL_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role);
                return (
                  <CommandItem
                    key={role}
                    value={role}
                    onSelect={() => toggleRole(role)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 opacity-50"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {ROLE_LABELS[role]}
                    {role === "admin" && (
                      <ShieldCheck className="ml-auto h-3 w-3 text-gold/70" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedRoles.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onChange([]);
                      setOpen(false);
                    }}
                    className="justify-center text-center cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    Limpar seleção
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
