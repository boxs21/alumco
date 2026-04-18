"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { SEDES } from "@/lib/config";
import { createClient } from "@/lib/supabase";
import { Users, BookOpen, TrendingUp, Award, Activity, ArrowRight } from "lucide-react";

interface Profile {
  id: string;
  sede_id: string | null;
  active: boolean;
}

interface Training {
  id: string;
  target_area: string;
  sede_id: string | null;
}

interface Assignment {
  user_id: string;
  training_id: string;
  status: string;
}

interface Certificate {
  user_id: string;
}

interface RecentCert {
  id: string;
  issued_at: string | null;
  profiles: { name: string | null; email: string | null } | null;
  trainings: { title: string } | null;
}

interface SedeStats {
  colaboradores: number;
  capacitaciones: number;
  cumplimiento: number;
  certificados: number;
}

function computeStats(
  profiles: Profile[],
  trainings: Training[],
  assignments: Assignment[],
  certificates: Certificate[],
  selectedSede: string
): SedeStats {
  const sedeId = selectedSede !== "global" ? selectedSede : null;

  const filteredProfiles = sedeId
    ? profiles.filter((p) => p.sede_id === sedeId)
    : profiles;
  const profileIds = new Set(filteredProfiles.map((p) => p.id));

  const filteredAssignments = sedeId
    ? assignments.filter((a) => profileIds.has(a.user_id))
    : assignments;

  const filteredTrainings = sedeId
    ? trainings.filter((t) => t.sede_id === sedeId || t.sede_id === null)
    : trainings;

  const total = filteredAssignments.length;
  const completed = filteredAssignments.filter((a) => a.status === "COMPLETED").length;
  const filteredCerts = sedeId
    ? certificates.filter((c) => profileIds.has(c.user_id))
    : certificates;

  return {
    colaboradores: filteredProfiles.filter((p) => p.active).length,
    capacitaciones: filteredTrainings.length,
    cumplimiento: total > 0 ? Math.round((completed / total) * 100) : 0,
    certificados: filteredCerts.length,
  };
}

export default function DashboardPage() {
  const [selectedSede, setSelectedSede] = useState("global");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [recentCerts, setRecentCerts] = useState<RecentCert[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const [
        { data: profilesData, error: e1 },
        { data: trainingsData, error: e2 },
        { data: assignmentsData, error: e3 },
        { data: certificatesData, error: e4 },
        { data: recentData },
      ] = await Promise.all([
        supabase.from("profiles").select("id, sede_id, active").eq("role", "COLLABORATOR"),
        supabase.from("trainings").select("id, target_area, sede_id").eq("status", "PUBLISHED"),
        supabase.from("assignments").select("user_id, training_id, status"),
        supabase.from("certificates").select("user_id"),
        supabase
          .from("certificates")
          .select("id, issued_at, profiles(name, email), trainings(title)")
          .order("issued_at", { ascending: false })
          .limit(5),
      ]);

      const firstError = e1 ?? e2 ?? e3 ?? e4;
      if (firstError) {
        console.error("[dashboard] load error:", firstError.message);
        setLoadError("No se pudieron cargar los datos del dashboard.");
        return;
      }

      setProfiles(profilesData ?? []);
      setTrainings(trainingsData ?? []);
      setAssignments(assignmentsData ?? []);
      setCertificates(certificatesData ?? []);
      setRecentCerts(((recentData ?? []) as unknown) as RecentCert[]);
    }

    load();
  }, []);

  const stats = computeStats(profiles, trainings, assignments, certificates, selectedSede);
  const concStats = computeStats(profiles, trainings, assignments, certificates, SEDES.CONCEPCION.id);
  const coyStats = computeStats(profiles, trainings, assignments, certificates, SEDES.COYHAIQUE.id);

  // Area progress from published trainings + assignments
  const areaMap: Record<string, { total: number; completed: number }> = {};
  for (const t of trainings) {
    if (!areaMap[t.target_area]) areaMap[t.target_area] = { total: 0, completed: 0 };
    const ta = assignments.filter((a) => a.training_id === t.id);
    areaMap[t.target_area].total += ta.length;
    areaMap[t.target_area].completed += ta.filter((a) => a.status === "COMPLETED").length;
  }
  const areaProgress = Object.entries(areaMap).map(([area, { total, completed }]) => ({
    area,
    progreso: total > 0 ? Math.round((completed / total) * 100) : 0,
  }));

  return (
    <div>
      <Topbar
        title="Dashboard"
        sub="Esto es lo que está pasando en ALUMCO hoy."
        right={
          <Link
            href="/admin/capacitaciones/nueva"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
          >
            <span className="text-base leading-none">+</span> Nueva capacitación
          </Link>
        }
      />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {loadError && (
          <div className="px-4 py-3 rounded-xl bg-[#ffe6e1] border border-[#ffccc5] text-[13px] text-[#e86154]">
            {loadError}
          </div>
        )}

        {/* Hero */}
        <div
          className="rounded-[20px] relative overflow-hidden text-white p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-center animate-fade-in-up"
          style={{ background: "linear-gradient(115deg, #2d4a8a 0%, #1f3769 58%, #16284d 100%)" }}
        >
          {/* Decorative blobs */}
          <div aria-hidden="true" className="pointer-events-none absolute right-[-60px] top-[-60px] w-[240px] h-[240px] rounded-full" style={{ background: "#ff7c6b", opacity: 0.28 }} />
          <div aria-hidden="true" className="pointer-events-none absolute right-[140px] bottom-[-50px] w-[130px] h-[130px] rounded-full" style={{ background: "#f2b544", opacity: 0.45 }} />

          <div className="relative z-10">
            <p className="text-[10.5px] font-[700] uppercase tracking-[0.18em] mb-3" style={{ opacity: 0.72 }}>
              Progreso semanal
            </p>
            <h2 className="text-[26px] lg:text-[32px] font-[800] leading-[1.1] tracking-[-0.03em] mb-3">
              Cuidados con{" "}
              <em className="not-italic" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontStyle: "italic", background: "linear-gradient(transparent 62%, rgba(242,181,68,0.35) 62%)", padding: "0 3px" }}>
                empatía,
              </em>
              <br />equipos con propósito.
            </h2>
            <p className="text-[13.5px] leading-[1.55] mb-5 max-w-[420px]" style={{ opacity: 0.78 }}>
              Mantén el ritmo con tus próximas asignaciones y capacita a tu equipo.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/admin/capacitaciones"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
              >
                Nueva capacitación <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/admin/reportes"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-white text-[13px] font-[600] transition-colors"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" }}
              >
                Ver reportes
              </Link>
            </div>
          </div>

          {/* Right illustration */}
          <div className="hidden lg:flex justify-end relative z-10">
            <svg viewBox="0 0 340 260" width="300" height="240" aria-hidden="true">
              <defs>
                <linearGradient id="hero-blob" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#ff7c6b" stopOpacity="0.85" />
                  <stop offset="1" stopColor="#e86154" stopOpacity="0.65" />
                </linearGradient>
                <linearGradient id="hero-blob2" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#f2b544" />
                  <stop offset="1" stopColor="#e09226" />
                </linearGradient>
              </defs>
              <path d="M60,150 C20,100 55,30 140,22 C220,14 270,4 320,60 C370,116 325,240 230,258 C135,276 100,200 60,150 Z" fill="url(#hero-blob)" opacity="0.9" />
              <circle cx="80" cy="80" r="44" fill="url(#hero-blob2)" />
              <path d="M160,175 C160,135 210,118 250,138 C290,158 296,215 264,238 C232,261 180,252 164,220 C157,204 160,190 160,175 Z" fill="rgba(255,255,255,0.1)" />
              <circle cx="298" cy="96" r="22" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="4 5" />
              <path d="M110,128 Q170,88 230,120" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <circle cx="230" cy="120" r="4" fill="white" />
              <circle cx="110" cy="128" r="4" fill="#f2b544" />
              <rect x="44" y="218" width="10" height="10" rx="2" fill="white" opacity="0.7" transform="rotate(20 49 223)" />
              <circle cx="316" cy="238" r="4" fill="white" opacity="0.7" />
            </svg>
          </div>
        </div>

        {/* Sede filter pills */}
        <div className="flex rounded-lg bg-[#eaf0fb] p-1 w-fit">
          {[
            { key: "global",           label: "Todas" },
            { key: SEDES.CONCEPCION.id, label: SEDES.CONCEPCION.nombre },
            { key: SEDES.COYHAIQUE.id,  label: SEDES.COYHAIQUE.nombre },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedSede(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedSede === tab.key
                  ? "bg-[#f6f3ee] text-[#15182b] shadow-sm"
                  : "text-[#6b7185] hover:text-[#15182b]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard title="Colaboradores activos" value={stats.colaboradores} icon={Users} delay={0} variant="navy" />
          <StatCard title="Capacitaciones publicadas" value={stats.capacitaciones} icon={BookOpen} delay={1} variant="default" />
          <StatCard title="Cumplimiento" value={`${stats.cumplimiento}%`} icon={TrendingUp} delay={2} variant="coral" />
          <StatCard title="Certificados emitidos" value={stats.certificados} icon={Award} delay={3} variant="mustard" />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Comparativa por sede */}
          <Card className="border-[#e8e4dc]/80 shadow-sm animate-fade-in-up stagger-4">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#15182b] mb-4 lg:mb-5">Comparativa por sede</h2>
              <div className="space-y-5 lg:space-y-6">
                {[
                  { sede: SEDES.CONCEPCION, s: concStats, color: "bg-[#2d4a8a]", barColor: "bg-[#2d4a8a]" },
                  { sede: SEDES.COYHAIQUE,  s: coyStats,  color: "bg-[#f2b544]",  barColor: "bg-[#f2b544]"  },
                ].map(({ sede, s, color, barColor }) => (
                  <div key={sede.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${color}`} />
                        <span className="text-sm font-medium text-[#15182b]">{sede.nombre}</span>
                      </div>
                      <span className="text-sm font-bold text-[#15182b]">{s.cumplimiento}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#eaf0fb] overflow-hidden">
                      <div className={`h-3 rounded-full ${barColor}`} style={{ width: `${s.cumplimiento}%` }} />
                    </div>
                    <p className="text-xs text-[#6b7185]">
                      {s.colaboradores} colaboradores &middot; {s.certificados} certificados
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actividad reciente */}
          <Card className="border-[#e8e4dc]/80 shadow-sm animate-fade-in-up stagger-5">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#15182b] mb-4 lg:mb-5">Actividad reciente</h2>
              {recentCerts.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Activity className="h-8 w-8 text-[#e8e4dc] mb-2" aria-hidden="true" />
                  <p className="text-sm text-[#6b7185]">Sin actividad reciente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCerts.map((c) => {
                    const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
                    const training = Array.isArray(c.trainings) ? c.trainings[0] : c.trainings;
                    const displayName = profile?.name ?? profile?.email ?? "Colaborador";
                    const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    const timeAgo = c.issued_at
                      ? (() => {
                          const diff = Date.now() - new Date(c.issued_at).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 60) return `hace ${mins}m`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `hace ${hrs}h`;
                          return `hace ${Math.floor(hrs / 24)}d`;
                        })()
                      : "";
                    return (
                      <div key={c.id} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#eaf0fb] flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-[#2d4a8a]">{initials}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[#15182b] leading-snug">
                            <span className="font-medium">{displayName}</span>
                            {" completó "}
                            <span className="font-medium">&ldquo;{training?.title ?? "—"}&rdquo;</span>
                          </p>
                          <p className="text-xs text-[#a5a9b8] mt-0.5">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progreso por área */}
          <Card className="border-[#e8e4dc]/80 shadow-sm animate-fade-in-up stagger-6">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#15182b] mb-4 lg:mb-5">Progreso por &aacute;rea</h2>
              {areaProgress.length > 0 ? (
                <div className="space-y-4 lg:space-y-6">
                  {areaProgress.map((item) => (
                    <div key={item.area} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#15182b]">{item.area}</span>
                        <span className="text-sm font-bold text-[#15182b]">{item.progreso}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-[#eaf0fb] overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-[#2d4a8a]"
                          style={{ width: `${item.progreso}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <TrendingUp className="h-8 w-8 text-[#e8e4dc] mb-2" aria-hidden="true" />
                  <p className="text-sm text-[#6b7185]">Sin datos de progreso</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
