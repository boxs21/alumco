"use client";

import { useState } from "react";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/ui/SedeBadge";
import { mockStats, SEDES } from "@/lib/mock-data";

type SedeFilter = "ALL" | "CONCEPCION" | "COYHAIQUE";

const C = {
  forest: "#1a5c4a", forestMid: "#2d7a62", forestLight: "#4aa87f",
  teal: "#0f7ea3", tealLight: "#e0f2f9",
  gold: "#c8943a", goldLight: "#fdf3e3",
  ink: "#121d1a", inkSoft: "#5a6e68", muted: "#8fa49e",
  border: "#d4e2dc", surface: "#f5f9f7", sagePale: "#e4ede9", white: "#ffffff",
};

const STAT_CARDS = [
  { key: "colaboradores",  label: "Colaboradores activos",     icon: "👥", bg: "rgba(74,168,127,0.12)" },
  { key: "capacitaciones", label: "Capacitaciones publicadas", icon: "📚", bg: "rgba(15,126,163,0.12)" },
  { key: "cumplimiento",   label: "Cumplimiento general",      icon: "✅", bg: "rgba(200,148,58,0.12)", suffix: "%" },
  { key: "certificados",   label: "Certificados emitidos",     icon: "🎓", bg: "rgba(168,197,181,0.25)" },
] as const;

const ACTIVIDAD = [
  { dot: C.forestLight, accion: "María González completó",        curso: "Protocolo de Higiene Personal",  tiempo: "hace 10 min", sede: SEDES.CONCEPCION },
  { dot: C.teal,        accion: "Ana Torres obtuvo certificado",  curso: "Protocolo de Higiene Personal",  tiempo: "hace 1 hr",   sede: SEDES.COYHAIQUE },
  { dot: C.gold,        accion: "Juan Pérez inició",              curso: "Manejo de Emergencias Médicas",  tiempo: "hace 2 hr",   sede: SEDES.CONCEPCION },
  { dot: C.forestLight, accion: "Carlos Ruiz completó",           curso: "Protocolo de Invierno",          tiempo: "hace 3 hr",   sede: SEDES.COYHAIQUE },
  { dot: C.teal,        accion: "María González rindió evaluación",curso: "Protocolo de Higiene Personal", tiempo: "ayer",        sede: SEDES.CONCEPCION },
];

const AREAS: Record<SedeFilter, { label: string; pct: number }[]> = {
  ALL:        [{ label: "Cuidado", pct: 80 }, { label: "Enfermería", pct: 55 }, { label: "Administración", pct: 90 }, { label: "General", pct: 70 }],
  CONCEPCION: [{ label: "Cuidado", pct: 85 }, { label: "Enfermería", pct: 62 }, { label: "Administración", pct: 92 }, { label: "General", pct: 75 }],
  COYHAIQUE:  [{ label: "Cuidado", pct: 74 }, { label: "Enfermería", pct: 45 }, { label: "Administración", pct: 88 }, { label: "General", pct: 63 }],
};

const card: React.CSSProperties = {
  background: C.white, border: `1.5px solid ${C.border}`,
  borderRadius: 12, boxShadow: "0 2px 12px rgba(26,92,74,0.09)",
};
const cardHeader: React.CSSProperties = {
  padding: "16px 22px 12px", borderBottom: `1px solid ${C.border}`,
  display: "flex", alignItems: "center", justifyContent: "space-between",
};
const cardBody: React.CSSProperties = { padding: 22 };

function Bar({ pct, color }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 6, background: C.sagePale, borderRadius: 10, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 10, width: `${pct}%`,
        background: color ?? `linear-gradient(90deg,${C.forestMid},${C.forestLight})`,
        transition: "width 0.4s ease",
      }} />
    </div>
  );
}

export default function DashboardPage() {
  const [sedeFilter, setSedeFilter] = useState<SedeFilter>("ALL");

  const statsKey = sedeFilter === "ALL" ? "global" : sedeFilter;
  const stats    = mockStats[statsKey];
  const areas    = AREAS[sedeFilter];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Resumen general de capacitaciones"
        showSedeFilter
        sedeFilter={sedeFilter}
        onSedeFilterChange={(s) => setSedeFilter(s as SedeFilter)}
      />

      <div className="page-content" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Stat cards ── */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {STAT_CARDS.map(({ key, label, icon, bg, suffix }) => (
            <div key={key} style={card}>
              <div style={cardBody}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: bg, marginBottom: 12 }}>
                  {icon}
                </div>
                <div className="stat-value" style={{ fontFamily: "Georgia,serif", fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1 }}>
                  {stats[key as keyof typeof stats]}{suffix ?? ""}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 5 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Grid 2 cols ── */}
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Comparativa sedes */}
          <div style={card}>
            <div style={cardHeader}>
              <span style={{ fontFamily: "Georgia,serif", fontSize: 15, color: C.ink }}>Comparativa entre sedes</span>
            </div>
            <div style={cardBody}>
              {[
                { sede: SEDES.CONCEPCION, s: mockStats.CONCEPCION, barColor: C.teal },
                { sede: SEDES.COYHAIQUE,  s: mockStats.COYHAIQUE,  barColor: C.gold },
              ].map(({ sede, s, barColor }) => (
                <div key={sede.slug} style={{ marginBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <SedeBadge sede={sede} />
                    <span style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: C.ink }}>{s.cumplimiento}%</span>
                  </div>
                  <Bar pct={s.cumplimiento} color={barColor} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: C.muted }}>
                    <span>{s.colaboradores} colaboradores</span>
                    <span>{s.certificados} certificados emitidos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad reciente */}
          <div style={card}>
            <div style={cardHeader}>
              <span style={{ fontFamily: "Georgia,serif", fontSize: 15, color: C.ink }}>Actividad reciente</span>
            </div>
            <div>
              {ACTIVIDAD.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 22px",
                  borderBottom: i < ACTIVIDAD.length - 1 ? `1px solid ${C.sagePale}` : "none",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.dot, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.4 }}>
                      <strong>{a.accion}</strong>{" "}
                      <span style={{ color: C.muted }}>{a.curso}</span>
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <SedeBadge sede={a.sede} />
                      <span style={{ fontSize: 11, color: C.muted }}>{a.tiempo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Progreso por área ── */}
        <div style={card}>
          <div style={cardHeader}>
            <span style={{ fontFamily: "Georgia,serif", fontSize: 15, color: C.ink }}>Progreso por área</span>
            <span style={{ fontSize: 12, color: C.muted }}>
              {sedeFilter === "ALL" ? "Todas las sedes" : sedeFilter === "CONCEPCION" ? "Concepción" : "Coyhaique"}
            </span>
          </div>
          <div style={{ ...cardBody, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 48px" }}>
            {areas.map(({ label, pct }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13, color: C.ink }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 600, color: C.inkSoft }}>{pct}%</span>
                </div>
                <Bar pct={pct} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
