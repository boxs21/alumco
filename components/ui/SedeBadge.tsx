"use client";

import type { Sede } from "@/lib/mock-data";

interface SedeBadgeProps {
  sede: Sede | null;
  className?: string;
}

export default function SedeBadge({ sede, className = "" }: SedeBadgeProps) {
  if (!sede) {
    // Global — ambas sedes
    return (
      <span
        className={`
          inline-flex items-center gap-1.5
          rounded-full px-3 py-1
          text-sm font-medium
          bg-[#e4ede9] text-muted
          ${className}
        `}
      >
        <span className="w-2 h-2 rounded-full bg-muted" />
        Ambas sedes
      </span>
    );
  }

  const isConcepcion = sede.slug === "CONCEPCION";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full px-3 py-1
        text-sm font-medium
        ${isConcepcion ? "bg-teal-light text-teal" : "bg-[#fdf3e3] text-gold"}
        ${className}
      `}
    >
      <span
        className={`w-2 h-2 rounded-full ${isConcepcion ? "bg-teal" : "bg-gold"}`}
      />
      {sede.nombre}
    </span>
  );
}
