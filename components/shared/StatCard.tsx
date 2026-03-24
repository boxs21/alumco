import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
  delay?: number;
}

export default function StatCard({ title, value, icon: Icon, description, trend, delay = 0 }: StatCardProps) {
  return (
    <Card
      className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <CardContent className="p-6 relative">
        {/* Subtle accent gradient at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-400 opacity-60" />

        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-slate-400 tracking-wide uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>{title}</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
            {trend && (
              <p className={`text-sm font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
                {trend.positive ? "+" : ""}{trend.value}% vs mes anterior
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/80">
            <Icon className="h-6 w-6 text-indigo-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
