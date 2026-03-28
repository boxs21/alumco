import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

/** Props de la tarjeta de estadística */
interface StatCardProps {
  title: string;                                    // nombre del indicador
  value: string | number;                           // valor a mostrar (número o texto)
  icon: LucideIcon;                                 // ícono representativo
  description?: string;                             // texto descriptivo opcional
  trend?: { value: number; positive: boolean };     // tendencia respecto al mes anterior
  delay?: number;                                   // retraso de animación de entrada
}

/**
 * Tarjeta de estadística para el dashboard.
 * Muestra un indicador clave con ícono, valor y tendencia opcional.
 */
export default function StatCard({ title, value, icon: Icon, description, trend, delay = 0 }: StatCardProps) {
  return (
    <Card
      className="border-[#dde0d4]/80 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <CardContent className="p-6 relative">
        {/* Forest green accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2d4a2b] via-[#4a7c59] to-[#a4ac86] opacity-60" />

        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-[#7d8471] font-medium tracking-wide uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>{title}</p>
            <p className="text-3xl font-bold text-[#1e2d1c] tracking-tight">{value}</p>
            {description && (
              <p className="text-sm text-[#7d8471]">{description}</p>
            )}
            {trend && (
              <p className={`text-sm font-medium ${trend.positive ? "text-[#4a7c59]" : "text-[#b74729]"}`}>
                {trend.positive ? "+" : ""}{trend.value}% vs mes anterior
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#f0f2eb] to-[#dde0d4]/60">
            <Icon className="h-6 w-6 text-[#2d4a2b]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
