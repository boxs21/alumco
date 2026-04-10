import { SEDES } from "@/lib/config";
import { Building } from "lucide-react";

interface SedeBadgeProps {
  sedeId: string | null;
  sedeName?: string | null;
  size?: "sm" | "md" | "lg";
}

// Uses CSS variables from ThemeProvider so colors adapt to ALL themes (light & dark)
// without needing any CSS override selectors.
const sedeStyles: Record<string, { label: string; ariaLabel: string; colorVar: string; bgVar: string }> = {
  s1: {
    label: SEDES.CONCEPCION.nombre,
    ariaLabel: `${SEDES.CONCEPCION.nombre} (Sede)`,
    colorVar: "var(--color-sede-concepcion)",
    bgVar:    "var(--color-sede-concepcion-bg)",
  },
  s2: {
    label: SEDES.COYHAIQUE.nombre,
    ariaLabel: `${SEDES.COYHAIQUE.nombre} (Sede)`,
    colorVar: "var(--color-sede-coyhaique)",
    bgVar:    "var(--color-sede-coyhaique-bg)",
  },
};

const globalStyle = {
  label: "Ambas sedes",
  ariaLabel: "Ambas sedes",
  colorVar: "var(--muted-foreground)",
  bgVar:    "var(--secondary)",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-sm",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export default function SedeBadge({ sedeId, sedeName, size = "md" }: SedeBadgeProps) {
  const style = sedeId ? (sedeStyles[sedeId] ?? globalStyle) : globalStyle;
  const label = sedeName ?? style.label;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClasses[size]}`}
      style={{
        color: style.colorVar,
        backgroundColor: style.bgVar,
      }}
      aria-label={style.ariaLabel}
    >
      <Building className={iconSizeClasses[size]} aria-hidden="true" />
      {label}
    </span>
  );
}
