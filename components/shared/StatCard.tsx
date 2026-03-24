import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
}

export default function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-semibold text-slate-900">{value}</p>
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
            {trend && (
              <p className={`text-sm font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
                {trend.positive ? "+" : ""}{trend.value}% vs mes anterior
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
            <Icon className="h-6 w-6 text-indigo-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
