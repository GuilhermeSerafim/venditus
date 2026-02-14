import React, { createContext, useContext, useEffect, useState } from "react";
import { useOrganization, ThemeConfig } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  themeConfig: ThemeConfig | null;
  updateThemeConfig: (config: Partial<ThemeConfig>) => Promise<void>;
  resetThemeConfig: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Convert a hex color string (#RRGGBB or #RGB) to HSL channel string "H S% L%" */
const hexToHSL = (hex: string): string => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

/** Normalise any color value to bare HSL channels "H S% L%" for Tailwind */
const toHSLChannels = (color: string): string => {
  if (color.startsWith("hsl")) {
    return color.replace(/hsl\(?\s*/, "").replace(/\)\s*$/, "");
  }
  if (color.startsWith("#")) {
    return hexToHSL(color);
  }
  return color; // already bare channels
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const { data: organization, isLoading: isOrgLoading, refetch } = useOrganization();

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("seven-theme");
      if (stored) return stored as Theme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);

  // Dark / Light mode class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("seven-theme", theme);
  }, [theme]);

  // Sync theme from organization
  useEffect(() => {
    if (organization?.theme_config) {
      setThemeConfig(organization.theme_config);
      applyThemeVariables(organization.theme_config);
    } else {
      applyDefaultTheme();
    }
  }, [organization]);

  const applyThemeVariables = (config: ThemeConfig) => {
    const root = window.document.documentElement;

    if (config.primaryColor) {
      const val = toHSLChannels(config.primaryColor);
      root.style.setProperty("--primary", val);
      root.style.setProperty("--ring", val);
      root.style.setProperty("--gold", val);
      root.style.setProperty("--gold-light", val);
      root.style.setProperty("--gold-dark", val);
    }

    if (config.secondaryColor) {
      const val = toHSLChannels(config.secondaryColor);
      root.style.setProperty("--secondary", val);
    }
  };

  const applyDefaultTheme = () => {
    const root = window.document.documentElement;
    root.style.removeProperty("--primary");
    root.style.removeProperty("--ring");
    root.style.removeProperty("--gold");
    root.style.removeProperty("--gold-light");
    root.style.removeProperty("--gold-dark");
    root.style.removeProperty("--secondary");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const updateThemeConfig = async (newConfig: Partial<ThemeConfig>) => {
    if (!organization) return;
    try {
      const updatedConfig = { ...(themeConfig || {}), ...newConfig } as ThemeConfig;

      const { error } = await supabase
        .from("organizations")
        .update({ theme_config: updatedConfig as any })
        .eq("id", organization.id);

      if (error) throw error;

      setThemeConfig(updatedConfig);
      applyThemeVariables(updatedConfig);

      toast({
        title: "Tema atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      refetch();
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar o tema.",
        variant: "destructive",
      });
    }
  };

  const resetThemeConfig = async () => {
    if (!organization) return;
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ theme_config: null })
        .eq("id", organization.id);

      if (error) throw error;

      setThemeConfig(null);
      applyDefaultTheme();

      toast({
        title: "Tema restaurado",
        description: "Voltando para o padrão Venditus.",
      });

      refetch();
    } catch (error) {
      console.error("Error resetting theme:", error);
      toast({
        title: "Erro",
        description: "Falha ao restaurar tema.",
        variant: "destructive",
      });
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        themeConfig,
        updateThemeConfig,
        resetThemeConfig,
        isLoading: isOrgLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
