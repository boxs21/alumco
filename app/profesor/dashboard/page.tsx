"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { SEDES } from "@/lib/config";
import { createClient } from "@/lib/supabase";
import { Users, BookOpen, TrendingUp, Award, Activity } from "lucide-react";

interface Profile  { id: string; sede_id: string | null; active: boolean }
interface Training { id: string; target_area: string; sede_id: string | null }
interface Assignment { user_id: string; training_id: string; status: string }
interface Certificate { user_id: string }
interface RecentCert {
  id: string;
  issued_at: string | null;
  profiles: { name: string | null; email: string | null } | null;
  trainings: { title: string } | null;
}
interface SedeStats { colaboradores: number; capacitaciones: number; cumplimiento: number; certificados: number }

function computeStats(
  profiles: Profile[], trainings: Training[], assignments: Assignment[],
  certificates: Certificate[], selectedSede: string
): SedeStats {
  const sedeId = selectedSede !== "global" ? selectedSede : null;
  const filteredProfiles = sedeId ? profiles.filter((p) => p.sede_id === sedeId) : profiles;
  const profileIds = new Set(filteredProfiles.map((p) => p.id));
  const filteredAssignments = sedeId ? assignments.filter((a) => profileIds.has(a.user_id)) : assignments;
  const filteredTrainings = sedeId ? trainings.filter((t) => t.sede_id === sedeId || t.sede_id === null) : trainings;
  const total = filteredAssignments.length;
  const completed = filteredAssignments.filter((a) => a.status === "COMPLETED").length;
  const filteredCerts = sedeId ? certificates.filter((c) => profileIds.has(c.user_id)) : certificates;
  return {
    colaboradores: filteredProfiles.filter((p) => p.active).length,
    capacitaciones: filteredTrainings.length,
    cumplimiento: total > 0 ? Math.round((completed / total) * 100) : 0,
    certificados: filteredCerts.length,
  };
}

export default function ProfesorDashboardPage() {
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
        supabase.from("certificates")
          .select("id, issued_at, profiles(name, email), trainings(title)")
          .order("issued_at", { ascending: false }).limit(5),
      ]);
      if (e1 ?? e2 ?? e3 ?? e4) { setLoadError("No se pudieron cargar los datos."); return; }
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
  const coyStats  = computeStats(profiles, trainings, assignments, certificates, SEDES.COYHAIQUE.id);

  const areaMap: Record<string, { total: number; completed: number }> = {};
  for (const t of trainings) {
    if (!areaMap[t.target_area]) areaMap[t.target_area] = { total: 0, completed: 0 };
    const ta = assignments.filter((a) => a.training_id === t.id);
    areaMap[t.target_area].total += ta.length;
    areaMap[t.target_area].completed += ta.filter((a) => a.status === "COMPLETED").length;
  }
  const areaProgress = Object.entries(areaMap).map(([area, { total, completed }]) => ({
    area, progreso: total > 0 ? Math.round((completed / total) * 100) : 0,
  }));

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {loadError && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{loadError}</div>
        )}
        <div className="flex rounded-lg bg-[#EEF2FF] p-1 w-fit">
          {[
            { key: "global",            label: "Todas" },
            { key: SEDES.CONCEPCION.id, label: SEDES.CONCEPCION.nombre },
            { key: SEDES.COYHAIQUE.id,  label: SEDES.COYHAIQUE.nombre },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setSelectedSede(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedSede === tab.key ? "bg-[#FAFBFF] text-[#1A2F6B] shadow-sm" : "text-[#6B7AB0] hover:text-[#1A2F6B]"
              }`}
            >{tab.label}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard title="Colaboradores activos"    value={stats.colaboradores}  icon={Users}     delay={0} />
          <StatCard title="Capacitaciones publicadas" value={stats.capacitaciones} icon={BookOpen}  delay={1} />
          <StatCard title="Cumplimiento"             value={`${stats.cumplimiento}%`} icon={TrendingUp} delay={2} />
          <StatCard title="Certificados emitidos"    value={stats.certificados}   icon={Award}     delay={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <Card className="border-[#C8D4EC]/80 shadow-sm animate-fade-in-up stagger-4">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#1A2F6B] mb-4 lg:mb-5">Comparativa por sede</h2>
              <div className="space-y-5 lg:space-y-6">
                {[
                  { sede: SEDES.CONCEPCION, s: concStats, color: "bg-[#2B4BA8]", barColor: "bg-[#2B4BA8]" },
                  { sede: SEDES.COYHAIQUE,  s: coyStats,  color: "bg-[#f9a620]",  barColor: "bg-[#f9a620]" },
                ].map(({ sede, s, color, barColor }) => (
                  <div key={sede.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${color}`} />
                        <span className="text-sm font-medium text-[#1A2F6B]">{sede.nombre}</span>
                      </div>
                      <span className="text-sm font-bold text-[#1A2F6B]">{s.cumplimiento}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#EEF2FF] overflow-hidden">
                      <div className={`h-3 rounded-full ${barColor}`} style={{ width: `${s.cumplimiento}%` }} />
                    </div>
                    <p className="text-xs text-[#4A5C8A]">{s.colaboradores} colaboradores &middot; {s.certificados} certificados</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C8D4EC]/80 shadow-sm animate-fade-in-up stagger-5">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#1A2F6B] mb-4 lg:mb-5">Actividad reciente</h2>
              {recentCerts.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Activity className="h-8 w-8 text-[#C8D4EC] mb-2" />
                  <p className="text-sm text-[#6B7AB0]">Sin actividad reciente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCerts.map((c) => {
                    const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
                    const training = Array.isArray(c.trainings) ? c.trainings[0] : c.trainings;
                    const displayName = profile?.name ?? profile?.email ?? "Colaborador";
                    const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    const timeAgo = c.issued_at ? (() => {
                      const diff = Date.now() - new Date(c.issued_at).getTime();
                      const mins = Math.floor(diff / 60000);
                      if (mins < 60) return `hace ${mins}m`;
                      const hrs = Math.floor(mins / 60);
                      if (hrs < 24) return `hace ${hrs}h`;
                      return `hace ${Math.floor(hrs / 24)}d`;
                    })() : "";
                    return (
                      <div key={c.id} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-[#2B4BA8]">{initials}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[#1A2F6B] leading-snug">
                            <span className="font-medium">{displayName}</span>{" completó "}
                            <span className="font-medium">&ldquo;{training?.title ?? "—"}&rdquo;</span>
                          </p>
                          <p className="text-xs text-[#8A9BC8] mt-0.5">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#C8D4EC]/80 shadow-sm animate-fade-in-up stagger-6">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#1A2F6B] mb-4 lg:mb-5">Progreso por área</h2>
              {areaProgress.length > 0 ? (
                <div className="space-y-4 lg:space-y-6">
                  {areaProgress.map((item) => (
                    <div key={item.area} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1A2F6B]">{item.area}</span>
                        <span className="text-sm font-bold text-[#1A2F6B]">{item.progreso}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-[#EEF2FF] overflow-hidden">
                        <div className="h-3 rounded-full bg-[#2B4BA8]" style={{ width: `${item.progreso}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <TrendingUp className="h-8 w-8 text-[#C8D4EC] mb-2" />
                  <p className="text-sm text-[#6B7AB0]">Sin datos de progreso</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
