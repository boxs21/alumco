"use client";

import { ReactNode } from "react";

type SedeFilter = "ALL" | "CONCEPCION" | "COYHAIQUE";

interface TopbarProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showSedeFilter?: boolean;
  sedeFilter?: SedeFilter;
  onSedeFilterChange?: (sede: SedeFilter) => void;
}

const sedeOptions: { value: SedeFilter; label: string }[] = [
  { value: "ALL", label: "Todas las sedes" },
  { value: "CONCEPCION", label: "Concepción" },
  { value: "COYHAIQUE", label: "Coyhaique" },
];

export default function Topbar({
  title,
  subtitle,
  action,
  showSedeFilter = false,
  sedeFilter = "ALL",
  onSedeFilterChange,
}: TopbarProps) {
  return (
    <div className="topbar sticky top-0 z-30 flex items-center justify-between gap-4 px-8 h-16 bg-white border-b border-border">
      {/* Left: title */}
      <div className="min-w-0">
        <h3 className="font-serif text-xl font-bold text-ink leading-tight truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right: sede filter + action */}
      <div className="flex items-center gap-3 shrink-0">
        {showSedeFilter && onSedeFilterChange && (
          <select
            value={sedeFilter}
            onChange={(e) =>
              onSedeFilterChange(e.target.value as SedeFilter)
            }
            className="
              h-10 px-3 pr-8
              rounded-lg border border-border bg-white
              text-base text-ink font-sans
              cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest
              appearance-none
              bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%238fa49e%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')]
              bg-[length:12px] bg-[right_10px_center] bg-no-repeat
            "
          >
            {sedeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {action && (
          <div className="topbar-action">{action}</div>
        )}
      </div>
    </div>
  );
}
