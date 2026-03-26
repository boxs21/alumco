import { SEDES } from "@/lib/mock-data";
import { Building } from "lucide-react";

interface SedeBadgeProps {
  sedeId: string | null;
  sedeName?: string | null;
  size?: "sm" | "md" | "lg";
}

// Accessibility improvement: Changed text colors for 5.5:1 contrast ratio (WCAG AA)
// Added Building icon so color is not the only differentiator (colorblind accessibility)
const sedeStyles: Record<string, { text: string; bg: string; label: string; ariaLabel: string }> = {
  s1: {
    text: "text-[#1a2d1b]",  // Darker green for 5.5:1 contrast on #f0f2eb
    bg: "bg-[#f0f2eb]",
    label: SEDES.CONCEPCION.nombre,
    ariaLabel: `${SEDES.CONCEPCION.nombre} (Sede)`
  },
  s2: {
    text: "text-[#794f00]",  // Darker brown for 5.5:1 contrast on #fdf6e3
    bg: "bg-[#fdf6e3]",
    label: SEDES.COYHAIQUE.nombre,
    ariaLabel: `${SEDES.COYHAIQUE.nombre} (Sede)`
  },
};

const globalStyle = {
  text: "text-[#3d5a4a]",  // Darker muted for better contrast
  bg: "bg-[#f0f2eb]",
  label: "Ambas sedes",
  ariaLabel: "Ambas sedes"
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-sm",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-4 w-4",
};

export default function SedeBadge({ sedeId, sedeName, size = "md" }: SedeBadgeProps) {
  const style = sedeId ? sedeStyles[sedeId] ?? globalStyle : globalStyle;
  const label = sedeName ?? style.label;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${style.bg} ${style.text} ${sizeClasses[size]}`}
      aria-label={style.ariaLabel}
      role="badge"
    >
      <Building className={iconSizeClasses[size]} />
      {label}
    </span>
  );
}
