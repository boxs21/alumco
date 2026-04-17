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
      className="border-[#C8D4EC]/80 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <CardContent className="p-6 relative">
        {/* Forest green accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#2B4BA8] opacity-60" />

        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-[#6B7AB0] font-medium tracking-wide uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>{title}</p>
            <p className="text-3xl font-bold text-[#1A2F6B] tracking-tight">{value}</p>
            {description && (
              <p className="text-sm text-[#6B7AB0]">{description}</p>
            )}
            {trend && (
              <p className={`text-sm font-medium ${trend.positive ? "text-[#2B4BA8]" : "text-[#E8445A]"}`}>
                {trend.positive ? "+" : ""}{trend.value}% vs mes anterior
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FF]">
            <Icon className="h-6 w-6 text-[#2B4BA8]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
