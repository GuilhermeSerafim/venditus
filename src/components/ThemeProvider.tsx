import React, { useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";

function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "43 74% 49%"; // Default gold

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

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

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: org, isLoading } = useOrganization();

  useEffect(() => {
    const root = document.documentElement;
    const defaultGold = "43 74% 49%";
    const defaultGray = "215 16% 47%"; // Neutral gray
    
    // Don't do anything while loading to avoid flash
    if (isLoading) return;
    
    if (org?.theme_config) {
      // PRIMARY COLOR
      if (org.theme_config.primaryColor) {
        let primaryValue = org.theme_config.primaryColor;
        
        if (primaryValue.startsWith('#')) {
          primaryValue = hexToHSL(primaryValue);
        } else if (primaryValue.startsWith('hsl')) {
          primaryValue = primaryValue.replace('hsl(', '').replace(')', '').replace(/,/g, '');
        }

        root.style.setProperty("--gold", primaryValue);
        root.style.setProperty("--primary", primaryValue);
        root.style.setProperty("--ring", primaryValue);
      }
      
      // SECONDARY COLOR
      if (org.theme_config.secondaryColor) {
        let secondaryValue = org.theme_config.secondaryColor;
        
        if (secondaryValue.startsWith('#')) {
          secondaryValue = hexToHSL(secondaryValue);
        } else if (secondaryValue.startsWith('hsl')) {
          secondaryValue = secondaryValue.replace('hsl(', '').replace(')', '').replace(/,/g, '');
        }

        root.style.setProperty("--secondary", secondaryValue);
        root.style.setProperty("--accent", secondaryValue);
      } else {
        // Use default if not set
        root.style.setProperty("--secondary", defaultGray);
        root.style.setProperty("--accent", defaultGray);
      }
      
      // TERTIARY COLOR (optional)
      if (org.theme_config.tertiaryColor) {
        let tertiaryValue = org.theme_config.tertiaryColor;
        
        if (tertiaryValue.startsWith('#')) {
          tertiaryValue = hexToHSL(tertiaryValue);
        } else if (tertiaryValue.startsWith('hsl')) {
          tertiaryValue = tertiaryValue.replace('hsl(', '').replace(')', '').replace(/,/g, '');
        }

        root.style.setProperty("--tertiary", tertiaryValue);
      }
    } else if (!isLoading && !org) {
      // Only reset to default gold when we're sure there's no org (after loading)
      root.style.setProperty("--gold", defaultGold);
      root.style.setProperty("--primary", defaultGold);
      root.style.setProperty("--ring", defaultGold);
      root.style.setProperty("--secondary", defaultGray);
      root.style.setProperty("--accent", defaultGray);
    }
  }, [org, isLoading]);

  return <>{children}</>;
};
