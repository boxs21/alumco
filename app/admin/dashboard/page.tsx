"use client";

import { useState } from "react";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/ui/SedeBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import { mockStats, SEDES } from "@/lib/mock-data";

type SedeFilter = "ALL" | "CONCEPCION" | "COYHAIQUE";

const STAT_CARDS = [
  { key: "colaboradores", label: "Colaboradores activos", icon: "👥", color: "bg-forest-light/15" },
  { key: "capacitaciones", label: "Capacitaciones publicadas", icon: "📚", color: "bg-teal/10" },
  { key: "cumplimiento", label: "Cumplimiento general", icon: "✅", color: "bg-gold/10", suffix: "%" },
  { key: "certificados", label: "Certificados emitidos", icon: "🎓", color: "bg-muted/10" },
] as const;

const ACTIVIDAD = [
  { dot: "#4aa87f", accion: "María González completó", curso: "Protocolo de Higiene Personal", tiempo: "hace 10 min", sede: SEDES.CONCEPCION },
  { dot: "#0f7ea3", accion: "Ana Torres obtuvo certificado", curso: "Protocolo de Higiene Personal", tiempo: "hace 1 hr", sede: SEDES.COYHAIQUE },
  { dot: "#c8943a", accion: "Juan Pérez inició", curso: "Manejo de Emergencias Médicas", tiempo: "hace 2 hr", sede: SEDES.CONCEPCION },
  { dot: "#4aa87f", accion: "Carlos Ruiz completó", curso: "Protocolo de Invierno", tiempo: "hace 3 hr", sede: SEDES.COYHAIQUE },
  { dot: "#0f7ea3", accion: "María González rindió evaluación", curso: "Protocolo de Higiene Personal", tiempo: "ayer", sede: SEDES.CONCEPCION },
];

const AREAS_PROGRESS: Record<SedeFilter, { label: string; pct: number }[]> = {
  ALL: [
    { label: "Cuidado", pct: 80 },
    { label: "Enfermería", pct: 55 },
    { label: "Administración", pct: 90 },
    { label: "General", pct: 70 },
  ],
  CONCEPCION: [
    { label: "Cuidado", pct: 85 },
    { label: "Enfermería", pct: 62 },
    { label: "Administración", pct: 92 },
    { label: "General", pct: 75 },
  ],
  COYHAIQUE: [
    { label: "Cuidado", pct: 74 },
    { label: "Enfermería", pct: 45 },
    { label: "Administración", pct: 88 },
    { label: "General", pct: 63 },
  ],
};

export default function DashboardPage() {
  const [sedeFilter, setSedeFilter] = useState<SedeFilter>("ALL");

  const statsKey = sedeFilter === "ALL" ? "global" : sedeFilter;
  const stats = mockStats[statsKey];
  const areas = AREAS_PROGRESS[sedeFilter];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Resumen general de capacitaciones"
        showSedeFilter
        sedeFilter={sedeFilter}
        onSedeFilterChange={(s) => setSedeFilter(s as SedeFilter)}
      />

      <div className="page-content p-7 space-y-6">

        {/* ── Stat cards ── */}
        <div className="stats-grid grid grid-cols-4 gap-4">
          {STAT_CARDS.map(({ key, label, icon, color, suffix }) => (
            <Card key={key}>
              <CardBody className="flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>
                  {icon}
                </div>
                <div>
                  <div className="stat-value font-serif text-[32px] font-bold text-ink leading-none">
                    {stats[key as keyof typeof stats]}{suffix ?? ""}
                  </div>
                  <div className="text-sm text-muted mt-1">{label}</div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* ── Grid 2 cols ── */}
        <div className="grid-2 grid grid-cols-2 gap-5">

          {/* Comparativa sedes */}
          <Card>
            <CardHeader>
              <h3 className="font-serif text-base font-bold text-ink">Comparativa entre sedes</h3>
            </CardHeader>
            <CardBody className="space-y-5">
              {[
                { sede: SEDES.CONCEPCION, stats: mockStats.CONCEPCION },
                { sede: SEDES.COYHAIQUE, stats: mockStats.COYHAIQUE },
              ].map(({ sede, stats: s }) => (
                <div key={sede.slug}>
                  <div className="flex items-center justify-between mb-2">
                    <SedeBadge sede={sede} />
                    <span className="font-serif text-xl font-bold text-ink">{s.cumplimiento}%</span>
                  </div>
                  <ProgressBar
                    value={s.cumplimiento}
                    color={sede.slug === "CONCEPCION" ? "bg-teal" : "bg-gold"}
                  />
                  <div className="flex justify-between mt-1.5 text-xs text-muted">
                    <span>{s.colaboradores} colaboradores</span>
                    <span>{s.certificados} certificados</span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Actividad reciente */}
          <Card>
            <CardHeader>
              <h3 className="font-serif text-base font-bold text-ink">Actividad reciente</h3>
            </CardHeader>
            <CardBody className="p-0">
              <ul>
                {ACTIVIDAD.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 px-6 py-3.5 border-b border-border last:border-0"
                  >
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.dot }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-ink leading-snug">
                        <span className="font-medium">{item.accion}</span>{" "}
                        <span className="text-muted">{item.curso}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <SedeBadge sede={item.sede} className="text-[11px] px-2 py-0.5" />
                        <span className="text-xs text-muted">{item.tiempo}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* ── Progreso por área ── */}
        <Card>
          <CardHeader>
            <h3 className="font-serif text-base font-bold text-ink">Progreso por área</h3>
            <span className="text-sm text-muted">
              {sedeFilter === "ALL" ? "Todas las sedes" : sedeFilter === "CONCEPCION" ? "Concepción" : "Coyhaique"}
            </span>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              {areas.map(({ label, pct }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-base text-ink font-medium">{label}</span>
                    <span className="text-base font-semibold text-ink">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} showLabel={false} />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

      </div>
    </>
  );
}
