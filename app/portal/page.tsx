"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SedeBadge from "@/components/shared/SedeBadge";
import { mockCollaboratorTrainings } from "@/lib/mock-data";
import { BookOpen, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

/** Configuración visual de los estados de capacitación para el portal del colaborador */
const statusConfig = {
  COMPLETED: { label: "Completado", icon: CheckCircle, className: "bg-emerald-50 text-emerald-700" },
  IN_PROGRESS: { label: "En progreso", icon: Clock, className: "bg-amber-50 text-amber-700" },
};

/**
 * Página de inicio del portal del colaborador.
 * Muestra todas las capacitaciones asignadas al usuario con su estado actual.
 */
export default function PortalPage() {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-[#1e2d1c]">Mis capacitaciones</h1>
          <p className="text-sm text-[#7d8471] mt-0.5">
            Capacitaciones asignadas a tu sede y globales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SedeBadge sedeId="s1" sedeName="Concepción" size="lg" />
          <span className="hidden sm:block text-sm font-medium text-[#1e2d1c]">María González</span>
        </div>
      </div>

      {/* Training Grid — 1 col mobile, 2 cols sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        {mockCollaboratorTrainings.map((training) => {
          const status = statusConfig[training.status];
          const StatusIcon = status.icon;
          return (
            <Link key={training.id} href={`/portal/capacitacion/${training.trainingId}`} className="block group">
              <Card className="border-[#dde0d4] shadow-sm transition-shadow group-hover:shadow-md h-full">
                <CardContent className="p-4 lg:p-5 flex flex-col gap-3 lg:gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0f2eb]">
                      <BookOpen className="h-5 w-5 text-[#2d4a2b]" />
                    </div>
                    <Badge className={status.className}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm lg:text-base font-semibold text-[#1e2d1c] group-hover:text-[#2d4a2b] transition-colors">
                      {training.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <SedeBadge sedeId="s1" sedeName="Concepción" size="sm" />
                    {training.score && (
                      <span className="text-sm text-[#7d8471]">Nota: {training.score}%</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
