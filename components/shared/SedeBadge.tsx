import { SEDES } from "@/lib/mock-data";

interface SedeBadgeProps {
  sedeId: string | null;
  sedeName?: string | null;
  size?: "sm" | "md" | "lg";
}

const sedeStyles: Record<string, { text: string; bg: string; label: string }> = {
  s1: { text: "text-[#2d4a2b]", bg: "bg-[#f0f2eb]", label: SEDES.CONCEPCION.nombre },
  s2: { text: "text-[#b8860b]", bg: "bg-[#fdf6e3]", label: SEDES.COYHAIQUE.nombre },
};

const globalStyle = { text: "text-[#7d8471]", bg: "bg-[#f0f2eb]", label: "Ambas sedes" };

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-sm",
};

export default function SedeBadge({ sedeId, sedeName, size = "md" }: SedeBadgeProps) {
  const style = sedeId ? sedeStyles[sedeId] ?? globalStyle : globalStyle;
  const label = sedeName ?? style.label;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${style.bg} ${style.text} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}
