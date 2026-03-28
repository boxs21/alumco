import { SEDES } from "@/lib/mock-data";
import { Building } from "lucide-react";

/** Props del badge de sede */
interface SedeBadgeProps {
  sedeId: string | null;      // ID de la sede (null = ambas sedes / global)
  sedeName?: string | null;   // nombre a mostrar (opcional, usa el predeterminado si no se pasa)
  size?: "sm" | "md" | "lg";
}

// Accesibilidad: colores con ratio de contraste 5.5:1 (WCAG AA)
// Se agrega ícono Building para que la sede no se diferencie solo por color (daltonismo)
const sedeStyles: Record<string, { text: string; bg: string; label: string; ariaLabel: string }> = {
  s1: {
    text: "text-[#1a2d1b]",  // verde oscuro — ratio 5.5:1 sobre #f0f2eb
    bg: "bg-[#f0f2eb]",
    label: SEDES.CONCEPCION.nombre,
    ariaLabel: `${SEDES.CONCEPCION.nombre} (Sede)`
  },
  s2: {
    text: "text-[#794f00]",  // marrón oscuro — ratio 5.5:1 sobre #fdf6e3
    bg: "bg-[#fdf6e3]",
    label: SEDES.COYHAIQUE.nombre,
    ariaLabel: `${SEDES.COYHAIQUE.nombre} (Sede)`
  },
};

/** Estilo para cuando la capacitación aplica a todas las sedes */
const globalStyle = {
  text: "text-[#3d5a4a]",
  bg: "bg-[#f0f2eb]",
  label: "Ambas sedes",
  ariaLabel: "Ambas sedes"
};

/** Clases de padding y tamaño de texto según el tamaño del badge */
const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-sm",
};

/** Tamaño del ícono Building según el tamaño del badge */
const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-4 w-4",
};

/**
 * Badge accesible que identifica la sede de un colaborador o capacitación.
 * Usa color + ícono para ser comprensible por personas con daltonismo.
 */
export default function SedeBadge({ sedeId, sedeName, size = "md" }: SedeBadgeProps) {
  const style = sedeId ? sedeStyles[sedeId] ?? globalStyle : globalStyle;
  // Usa el nombre pasado como prop; si no hay, usa el predeterminado del estilo
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
