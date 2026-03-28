"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { themes, getThemeById, DEFAULT_THEME, type Theme } from "@/lib/themes";

/** Tipo del contexto que expone el tema activo y la función para cambiarlo */
interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (id: string) => void;
  themes: Theme[];
}

// Contexto de React para compartir el tema entre todos los componentes
const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Hook personalizado para acceder al tema actual desde cualquier componente.
 * Si se usa fuera del proveedor (por ejemplo en SSR), retorna el tema por defecto.
 */
export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback para SSR / generación estática (sin acceso al DOM)
    const fallback = getThemeById(DEFAULT_THEME);
    return { currentTheme: fallback, setTheme: () => {}, themes };
  }
  return ctx;
}

/**
 * Aplica las variables CSS del tema seleccionado directamente en el elemento <html>.
 * Esto permite que todos los componentes que usen variables CSS se actualicen automáticamente.
 */
function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  const c = theme.colors;

  // Atributo para identificar el tema activo en el CSS
  root.setAttribute("data-theme", theme.id);

  // Sobreescribe las variables CSS de shadcn/ui con los colores del tema
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

  // Dark mode: toggle data-dark for CSS overrides
  if (theme.dark) {
    root.setAttribute("data-dark", "true");
    // Dark themes need white text on primary buttons
    root.style.setProperty("--primary-foreground", "#ffffff");
    // Emerald badges need darker bg in dark mode
    root.style.setProperty("--color-emerald-bg", "#0f2a1a");
    root.style.setProperty("--color-emerald-text", "#6ee7b7");
    root.style.setProperty("--color-amber-bg", "#2a2010");
    root.style.setProperty("--color-amber-text", "#fcd34d");
  } else {
    root.removeAttribute("data-dark");
    root.style.removeProperty("--color-emerald-bg");
    root.style.removeProperty("--color-emerald-text");
    root.style.removeProperty("--color-amber-bg");
    root.style.removeProperty("--color-amber-text");
  }
}

/**
 * Proveedor del tema para toda la aplicación.
 * Al montarse, lee el tema guardado en localStorage y lo aplica al DOM.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getThemeById(DEFAULT_THEME));
  // Evita mostrar contenido hasta que el tema esté cargado desde localStorage
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Recupera el tema guardado por el usuario; si no existe, usa el tema por defecto
    const savedThemeId = localStorage.getItem("alumco_theme") ?? DEFAULT_THEME;
    const theme = getThemeById(savedThemeId);
    setCurrentTheme(theme);
    applyThemeToDOM(theme);
    setMounted(true);
  }, []);

  const setTheme = useCallback((id: string) => {
    // Cambia el tema, lo guarda en localStorage y actualiza el DOM inmediatamente
    const theme = getThemeById(id);
    setCurrentTheme(theme);
    localStorage.setItem("alumco_theme", id);
    applyThemeToDOM(theme);
  }, []);

  // Oculta el contenido hasta que el tema correcto esté aplicado (evita parpadeo)
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}
