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
    if (org?.theme_config?.primaryColor) {
      const root = document.documentElement;
      const primaryHSL = hexToHSL(org.theme_config.primaryColor);
      
      // Update CSS variables
      // We assume the stored color is Hex, but index.css uses HSL space-separated
      // Our helper converts Hex to HSL string "H S% L%"
      
      // Since the input might be HSL string directly or Hex, we need to handle it.
      // The default migration sets it as "hsl(43 74% 49%)" string or similar in JSON?
      // Migration said: '{"primaryColor": "hsl(43 74% 49%)", ...}'
      // Let's assume the admin input will be Hex (color picker) and we store it as checks.
      
      // If the value in DB is already HSL string (from default), use it directly but strip "hsl(" and ")"
      let colorValue = org.theme_config.primaryColor;
      
      if (colorValue.startsWith('#')) {
         colorValue = hexToHSL(colorValue);
      } else if (colorValue.startsWith('hsl')) {
         colorValue = colorValue.replace('hsl(', '').replace(')', '').replace(/,/g, '');
      }

      root.style.setProperty("--gold", colorValue);
      root.style.setProperty("--primary", colorValue);
      root.style.setProperty("--ring", colorValue);
      // We could calculate light/dark variants here if we wanted to be fancy
    }
  }, [org]);

  return <>{children}</>;
};
