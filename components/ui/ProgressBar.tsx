"use client";

interface ProgressBarProps {
  value: number; // 0–100
  color?: string; // Tailwind bg class or hex fallback
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  color = "bg-forest",
  showLabel = true,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2.5 rounded-full bg-surface overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted min-w-[3ch] text-right">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
