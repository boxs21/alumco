"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Palette, Check, X } from "lucide-react";

export default function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Required so createPortal only runs on the client
  useEffect(() => { setMounted(true); }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // ── Modal rendered via portal so it's always relative to the viewport,
  //    regardless of any backdrop-filter / transform on the trigger's ancestor.
  const modal = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/20 backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Selector de tema de colores"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90vw] max-w-md animate-scale-in"
      >
        <div
          className="rounded-2xl border shadow-2xl overflow-hidden"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Tema de colores
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                Selecciona una paleta para la interfaz
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar selector de temas"
              className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-[var(--secondary)] transition-colors"
            >
              <X className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>

          {/* Theme Grid */}
          <div className="p-4 grid grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto">
            {themes.map((theme) => {
              const isActive = currentTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`relative flex flex-col gap-2.5 p-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                    isActive ? "ring-2 ring-offset-1" : "hover:scale-[1.02]"
                  }`}
                  style={{
                    borderColor: isActive ? theme.colors.primary : "var(--border)",
                    backgroundColor: isActive ? theme.colors.secondary : "var(--background)",
                    // @ts-expect-error CSS custom property
                    "--tw-ring-color": theme.colors.primary,
                  }}
                >
                  {/* Active check */}
                  {isActive && (
                    <div
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}

                  {/* Color swatches */}
                  <div className="flex gap-1.5">
                    {theme.preview.map((color, i) => (
                      <div
                        key={i}
                        className="h-6 flex-1 rounded-md border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Name + description */}
                  <div>
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{ color: theme.colors.foreground }}
                    >
                      {theme.name}
                    </p>
                    <p
                      className="text-[11px] leading-tight mt-0.5"
                      style={{ color: theme.colors.mutedForeground }}
                    >
                      {theme.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 border-t flex items-center gap-2"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex gap-1">
              {currentTheme.preview.map((color, i) => (
                <span
                  key={i}
                  className="h-3 w-3 rounded-full border border-black/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              Tema actual: {currentTheme.name}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Cambiar tema de colores"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={
          compact
            ? "flex items-center justify-center h-9 w-9 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] transition-colors"
            : "flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-all duration-200"
        }
      >
        <Palette className={compact ? "h-4 w-4" : "h-[18px] w-[18px] flex-shrink-0"} style={{ color: "var(--muted-foreground)" }} />
        {!compact && <span>Cambiar tema</span>}
      </button>

      {/* Portal: renders at document.body so fixed positioning is always viewport-relative */}
      {mounted && isOpen && createPortal(modal, document.body)}
    </div>
  );
}
