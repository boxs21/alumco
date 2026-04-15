"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function DarkModeToggle({ compact = false }: { compact?: boolean }) {
  const { currentTheme, setTheme } = useTheme();
  const isDark = currentTheme.dark === true;

  function toggle() {
    setTheme(isDark ? "airtable-light" : "airtable-dark");
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        title={isDark ? "Modo claro" : "Modo oscuro"}
        className="flex items-center justify-center h-9 w-9 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] transition-colors"
      >
        {isDark
          ? <Sun  className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
          : <Moon className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
        }
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[var(--secondary)]"
      style={{ color: "var(--muted-foreground)" }}
    >
      {isDark
        ? <Sun  className="h-[18px] w-[18px] flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
        : <Moon className="h-[18px] w-[18px] flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
      }
      <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
    </button>
  );
}
