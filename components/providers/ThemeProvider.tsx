"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { themes, getThemeById, DEFAULT_THEME, type Theme } from "@/lib/themes";

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (id: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for SSR / static generation
    const fallback = getThemeById(DEFAULT_THEME);
    return { currentTheme: fallback, setTheme: () => {}, themes };
  }
  return ctx;
}

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  const c = theme.colors;

  // Set data-theme attribute
  root.setAttribute("data-theme", theme.id);

  // Override shadcn CSS variables
  root.style.setProperty("--primary", c.primary);
  root.style.setProperty("--primary-foreground", "#ffffff");
  root.style.setProperty("--background", c.background);
  root.style.setProperty("--foreground", c.foreground);
  root.style.setProperty("--secondary", c.secondary);
  root.style.setProperty("--secondary-foreground", c.foreground);
  root.style.setProperty("--muted", c.secondary);
  root.style.setProperty("--muted-foreground", c.mutedForeground);
  root.style.setProperty("--accent", c.secondary);
  root.style.setProperty("--accent-foreground", c.foreground);
  root.style.setProperty("--border", c.border);
  root.style.setProperty("--input", c.border);
  root.style.setProperty("--ring", c.primary);
  root.style.setProperty("--card", c.cardBg);
  root.style.setProperty("--card-foreground", c.foreground);
  root.style.setProperty("--popover", c.cardBg);
  root.style.setProperty("--popover-foreground", c.foreground);
  root.style.setProperty("--sidebar", c.cardBg);
  root.style.setProperty("--sidebar-foreground", c.foreground);
  root.style.setProperty("--sidebar-primary", c.primary);
  root.style.setProperty("--sidebar-accent", c.secondary);
  root.style.setProperty("--sidebar-border", c.border);

  // Forest Canopy theme semantic variables
  root.style.setProperty("--color-forest", c.primary);
  root.style.setProperty("--color-forest-hover", c.primaryHover);
  root.style.setProperty("--color-forest-light", c.secondary);
  root.style.setProperty("--color-forest-olive", c.accent);
  root.style.setProperty("--color-forest-sage", c.mutedForeground);
  root.style.setProperty("--color-forest-ivory", c.background);
  root.style.setProperty("--color-forest-text", c.foreground);
  root.style.setProperty("--color-forest-border", c.border);

  // Sede colors
  root.style.setProperty("--color-sede-concepcion", c.sedeConcepcion);
  root.style.setProperty("--color-sede-concepcion-bg", c.sedeConcepcionBg);
  root.style.setProperty("--color-sede-coyhaique", c.sedeCoyhaique);
  root.style.setProperty("--color-sede-coyhaique-bg", c.sedeCoyhaiqueBg);

  // Chart colors
  root.style.setProperty("--chart-1", c.primary);
  root.style.setProperty("--chart-2", c.primaryHover);
  root.style.setProperty("--chart-5", c.accent);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getThemeById(DEFAULT_THEME));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedThemeId = localStorage.getItem("alumco_theme") ?? DEFAULT_THEME;
    const theme = getThemeById(savedThemeId);
    setCurrentTheme(theme);
    applyThemeToDOM(theme);
    setMounted(true);
  }, []);

  const setTheme = useCallback((id: string) => {
    const theme = getThemeById(id);
    setCurrentTheme(theme);
    localStorage.setItem("alumco_theme", id);
    applyThemeToDOM(theme);
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}
