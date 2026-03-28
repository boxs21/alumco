"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

/** Niveles de tamaño de fuente disponibles en la aplicación */
export type FontSizeLevel = "normal" | "large" | "xlarge";

/** Configuración de cada opción de tamaño de fuente */
interface FontSizeOption {
  id: FontSizeLevel;
  label: string;
  description: string;
  htmlFontSize: string; // valor en px que se aplica al elemento <html>
  sampleSize: string;   // tamaño de muestra para la vista previa en la UI
}

/** Opciones disponibles de tamaño de fuente con sus tamaños en píxeles */
export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  {
    id: "normal",
    label: "Normal",
    description: "Tamaño estándar de lectura",
    htmlFontSize: "15px",
    sampleSize: "15px",
  },
  {
    id: "large",
    label: "Grande",
    description: "Texto más grande, fácil de leer",
    htmlFontSize: "17px",
    sampleSize: "17px",
  },
  {
    id: "xlarge",
    label: "Extra Grande",
    description: "Máxima legibilidad",
    htmlFontSize: "19.5px",
    sampleSize: "19.5px",
  },
];

/** Tipo del contexto que expone el tamaño de fuente activo */
interface FontSizeContextType {
  fontSize: FontSizeLevel;
  setFontSize: (level: FontSizeLevel) => void;
  options: FontSizeOption[];
}

// Contexto global para compartir el tamaño de fuente entre componentes
const FontSizeContext = createContext<FontSizeContextType | null>(null);

// Clave usada para persistir la preferencia en localStorage
const STORAGE_KEY = "alumco_fontsize";

/**
 * Hook para acceder al tamaño de fuente actual desde cualquier componente.
 * Devuelve 'normal' como fallback en SSR.
 */
export function useFontSize(): FontSizeContextType {
  const ctx = useContext(FontSizeContext);
  if (!ctx) {
    // Fallback para SSR (sin localStorage ni DOM)
    return {
      fontSize: "normal",
      setFontSize: () => {},
      options: FONT_SIZE_OPTIONS,
    };
  }
  return ctx;
}

/**
 * Aplica el tamaño de fuente seleccionado al elemento <html>.
 * Todos los tamaños rem de la app se escalan automáticamente a partir de esto.
 */
function applyFontSizeToDOM(level: FontSizeLevel) {
  const option = FONT_SIZE_OPTIONS.find((o) => o.id === level) ?? FONT_SIZE_OPTIONS[0];
  const root = document.documentElement;
  root.setAttribute("data-fontsize", level);
  root.style.fontSize = option.htmlFontSize;
}

/**
 * Proveedor del tamaño de fuente para toda la aplicación.
 * Lee la preferencia guardada en localStorage al montarse.
 */
export default function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSizeLevel>("normal");

  useEffect(() => {
    // Restaura la preferencia guardada; si no es válida, usa 'normal'
    const saved = localStorage.getItem(STORAGE_KEY) as FontSizeLevel | null;
    const level = saved && FONT_SIZE_OPTIONS.some((o) => o.id === saved) ? saved : "normal";
    setFontSizeState(level);
    applyFontSizeToDOM(level);
  }, []);

  const setFontSize = useCallback((level: FontSizeLevel) => {
    // Actualiza el estado, guarda en localStorage y aplica al DOM
    setFontSizeState(level);
    localStorage.setItem(STORAGE_KEY, level);
    applyFontSizeToDOM(level);
  }, []);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize, options: FONT_SIZE_OPTIONS }}>
      {children}
    </FontSizeContext.Provider>
  );
}
