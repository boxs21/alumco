import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
  delay?: number;
  variant?: "default" | "navy" | "coral" | "mustard" | "green";
}

const variantStyles = {
  default: {
    card: "bg-white border-[#e8e4dc]",
    icon: "bg-[#eaf0fb]",
    iconColor: "text-[#2d4a8a]",
    label: "text-[#6b7185]",
    value: "text-[#15182b]",
    accent: "bg-[#2d4a8a]",
  },
  navy: {
    card: "bg-[#2d4a8a] border-[#2d4a8a]",
    icon: "bg-white/18",
    iconColor: "text-white",
    label: "text-white/70",
    value: "text-white",
    accent: "bg-[#ff7c6b]",
  },
  coral: {
    card: "bg-[#ff7c6b] border-[#ff7c6b]",
    icon: "bg-white/18",
    iconColor: "text-white",
    label: "text-white/70",
    value: "text-white",
    accent: "bg-white/30",
  },
  mustard: {
    card: "bg-[#f2b544] border-[#f2b544]",
    icon: "bg-[#4a3410]/18",
    iconColor: "text-[#4a3410]",
    label: "text-[#4a3410]/70",
    value: "text-[#4a3410]",
    accent: "bg-[#4a3410]/18",
  },
  green: {
    card: "bg-[#dbeee3] border-[#c3e0d0]",
    icon: "bg-[#3c9d70]/15",
    iconColor: "text-[#3c9d70]",
    label: "text-[#1a6a43]",
    value: "text-[#3c9d70]",
    accent: "bg-[#3c9d70]",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  delay = 0,
  variant = "default",
}: StatCardProps) {
  const s = variantStyles[variant];

  return (
    <Card
      className={`border shadow-sm overflow-hidden animate-fade-in-up relative ${s.card}`}
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      {/* Top accent stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${s.accent} opacity-70`} />

      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 min-w-0">
            <p className={`text-[11.5px] font-[700] uppercase tracking-[0.05em] ${s.label}`}>
              {title}
            </p>
            <p className={`text-[32px] font-[800] leading-none tracking-[-0.03em] tabular-nums ${s.value}`}>
              {value}
            </p>
            {description && (
              <p className={`text-[11.5px] font-[500] mt-1 ${s.label}`}>{description}</p>
            )}
            {trend && (
              <p className={`text-[11.5px] font-[600] mt-1 ${
                variant !== "default"
                  ? "text-white/80"
                  : trend.positive
                    ? "text-[#3c9d70]"
                    : "text-[#ff7c6b]"
              }`}>
                {trend.positive ? "↑" : "↓"} {trend.value}% vs. mes anterior
              </p>
            )}
          </div>
          <div className={`flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] ${s.icon}`}>
            <Icon className={`h-5 w-5 ${s.iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
