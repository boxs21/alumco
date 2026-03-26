"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type FontSizeLevel = "normal" | "large" | "xlarge";

interface FontSizeOption {
  id: FontSizeLevel;
  label: string;
  description: string;
  htmlFontSize: string; // px value applied to <html>
  sampleSize: string;   // for preview in the UI
}

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

interface FontSizeContextType {
  fontSize: FontSizeLevel;
  setFontSize: (level: FontSizeLevel) => void;
  options: FontSizeOption[];
}

const FontSizeContext = createContext<FontSizeContextType | null>(null);

const STORAGE_KEY = "alumco_fontsize";

export function useFontSize(): FontSizeContextType {
  const ctx = useContext(FontSizeContext);
  if (!ctx) {
    // SSR fallback
    return {
      fontSize: "normal",
      setFontSize: () => {},
      options: FONT_SIZE_OPTIONS,
    };
  }
  return ctx;
}

function applyFontSizeToDOM(level: FontSizeLevel) {
  const option = FONT_SIZE_OPTIONS.find((o) => o.id === level) ?? FONT_SIZE_OPTIONS[0];
  const root = document.documentElement;
  root.setAttribute("data-fontsize", level);
  root.style.fontSize = option.htmlFontSize;
}

export default function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSizeLevel>("normal");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as FontSizeLevel | null;
    const level = saved && FONT_SIZE_OPTIONS.some((o) => o.id === saved) ? saved : "normal";
    setFontSizeState(level);
    applyFontSizeToDOM(level);
  }, []);

  const setFontSize = useCallback((level: FontSizeLevel) => {
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
