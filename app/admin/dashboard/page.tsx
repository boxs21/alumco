"use client";

import { useState } from "react";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/shared/StatCard";
import SedeBadge from "@/components/shared/SedeBadge";
import { Card, CardContent } from "@/components/ui/card";
import { mockStats, mockRecentActivity, mockAreaProgress, SEDES } from "@/lib/mock-data";
import { Users, BookOpen, TrendingUp, Award } from "lucide-react";

export default function DashboardPage() {
  const [selectedSede, setSelectedSede] = useState("global");

  const stats = mockStats[selectedSede] ?? mockStats.global;

  return (
    <div>
      <Topbar
        selectedSede={selectedSede}
        onSedeChange={setSelectedSede}
        title="Dashboard"
      />

      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Colaboradores activos" value={stats.colaboradores} icon={Users} delay={0} />
          <StatCard title="Capacitaciones publicadas" value={stats.capacitaciones} icon={BookOpen} delay={1} />
          <StatCard title="Cumplimiento" value={`${stats.cumplimiento}%`} icon={TrendingUp} delay={2} />
          <StatCard title="Certificados emitidos" value={stats.certificados} icon={Award} delay={3} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Comparativa de sedes */}
          <Card className="border-slate-200/80 shadow-sm col-span-1 animate-fade-in-up stagger-4">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-5">Comparativa por sede</h2>
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600" />
                      <span className="text-sm font-medium text-slate-700">{SEDES.CONCEPCION.nombre}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{mockStats.CONCEPCION.cumplimiento}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 animate-progress"
                      style={{ width: `${mockStats.CONCEPCION.cumplimiento}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    {mockStats.CONCEPCION.colaboradores} colaboradores &middot; {mockStats.CONCEPCION.certificados} certificados
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
                      <span className="text-sm font-medium text-slate-700">{SEDES.COYHAIQUE.nombre}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{mockStats.COYHAIQUE.cumplimiento}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 animate-progress"
                      style={{ width: `${mockStats.COYHAIQUE.cumplimiento}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    {mockStats.COYHAIQUE.colaboradores} colaboradores &middot; {mockStats.COYHAIQUE.certificados} certificados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actividad reciente */}
          <Card className="border-slate-200/80 shadow-sm col-span-1 animate-fade-in-up stagger-5">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-5">Actividad reciente</h2>
              <div className="space-y-4">
                {mockRecentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 animate-fade-in"
                    style={{ animationDelay: `${0.4 + index * 0.08}s` }}
                  >
                    <div className="mt-0.5">
                      <SedeBadge sedeId={activity.sedeId} sedeName={activity.sede} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{activity.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progreso por área */}
          <Card className="border-slate-200/80 shadow-sm col-span-1 animate-fade-in-up stagger-6">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-5">Progreso por &aacute;rea</h2>
              <div className="space-y-6">
                {mockAreaProgress.map((item) => (
                  <div key={item.area} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{item.area}</span>
                      <span className="text-sm font-bold text-slate-900">{item.progreso}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 animate-progress"
                        style={{ width: `${item.progreso}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
