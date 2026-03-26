"use client";

import { useFontSize, type FontSizeLevel } from "@/components/providers/FontSizeProvider";
import { Type } from "lucide-react";

/**
 * Accessible font-size toggle with 3 preset levels.
 * - `compact` = icon-only button that cycles through sizes (for mobile / topbar)
 * - default  = full inline group with labeled buttons (for sidebar / settings)
 */
export default function FontSizeSwitcher({ compact = false }: { compact?: boolean }) {
  const { fontSize, setFontSize, options } = useFontSize();

  const currentIndex = options.findIndex((o) => o.id === fontSize);

  // Compact mode: cycle through sizes on click
  function handleCycle() {
    const nextIndex = (currentIndex + 1) % options.length;
    setFontSize(options[nextIndex].id);
  }

  // Compact: single icon button that cycles
  if (compact) {
    return (
      <button
        type="button"
        onClick={handleCycle}
        aria-label={`Tamaño de texto: ${options[currentIndex].label}. Pulsa para cambiar.`}
        title={`Texto: ${options[currentIndex].label}`}
        className="flex items-center justify-center h-9 w-9 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] transition-colors relative"
      >
        <Type className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
        {/* Size indicator dot */}
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-3.5 w-3.5 rounded-full text-[7px] font-bold leading-none"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
          aria-hidden="true"
        >
          {fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++"}
        </span>
      </button>
    );
  }

  // Full mode: radio-style group for sidebar/settings
  return (
    <div
      role="radiogroup"
      aria-label="Tamaño de texto"
      className="flex flex-col gap-1.5"
    >
      <div
        className="flex items-center gap-2 px-3 py-1"
      >
        <Type className="h-4 w-4 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--muted-foreground)" }}
        >
          Tamaño de texto
        </span>
      </div>

      <div className="flex gap-1 px-3">
        {options.map((option) => {
          const isActive = fontSize === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${option.label}: ${option.description}`}
              onClick={() => setFontSize(option.id as FontSizeLevel)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-center transition-all duration-200 border-2 cursor-pointer ${
                isActive
                  ? "shadow-sm"
                  : "hover:scale-[1.02]"
              }`}
              style={{
                borderColor: isActive ? "var(--primary)" : "var(--border)",
                backgroundColor: isActive ? "var(--secondary)" : "var(--background)",
              }}
            >
              <span
                className="font-bold leading-none"
                style={{
                  fontSize: option.sampleSize === "15px" ? "13px" : option.sampleSize === "17px" ? "15px" : "17px",
                  color: isActive ? "var(--primary)" : "var(--foreground)",
                }}
                aria-hidden="true"
              >
                Aa
              </span>
              <span
                className="text-[10px] font-medium leading-tight"
                style={{
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                }}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
