"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { SEDES } from "@/lib/config";
import { createClient } from "@/lib/supabase";
import { Users, BookOpen, TrendingUp, Award, Activity } from "lucide-react";

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
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const [
        { data: profilesData, error: e1 },
        { data: trainingsData, error: e2 },
        { data: assignmentsData, error: e3 },
        { data: certificatesData, error: e4 },
      ] = await Promise.all([
        supabase.from("profiles").select("id, sede_id, active").eq("role", "COLLABORATOR"),
        supabase.from("trainings").select("id, target_area, sede_id").eq("status", "PUBLISHED"),
        supabase.from("assignments").select("user_id, training_id, status"),
        supabase.from("certificates").select("user_id"),
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
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="Dashboard" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {loadError && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard title="Colaboradores activos" value={stats.colaboradores} icon={Users} delay={0} />
          <StatCard title="Capacitaciones publicadas" value={stats.capacitaciones} icon={BookOpen} delay={1} />
          <StatCard title="Cumplimiento" value={`${stats.cumplimiento}%`} icon={TrendingUp} delay={2} />
          <StatCard title="Certificados emitidos" value={stats.certificados} icon={Award} delay={3} />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Comparativa por sede */}
          <Card className="border-[#dde0d4]/80 shadow-sm animate-fade-in-up stagger-4">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c] mb-4 lg:mb-5">Comparativa por sede</h2>
              <div className="space-y-5 lg:space-y-6">
                {[
                  { sede: SEDES.CONCEPCION, s: concStats, color: "bg-[#2d4a2b]", barColor: "bg-[#2d4a2b]" },
                  { sede: SEDES.COYHAIQUE,  s: coyStats,  color: "bg-[#f9a620]",  barColor: "bg-[#f9a620]"  },
                ].map(({ sede, s, color, barColor }) => (
                  <div key={sede.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${color}`} />
                        <span className="text-sm font-medium text-[#1e2d1c]">{sede.nombre}</span>
                      </div>
                      <span className="text-sm font-bold text-[#1e2d1c]">{s.cumplimiento}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#f0f2eb] overflow-hidden">
                      <div className={`h-3 rounded-full ${barColor}`} style={{ width: `${s.cumplimiento}%` }} />
                    </div>
                    <p className="text-xs text-[#6b7260]">
                      {s.colaboradores} colaboradores &middot; {s.certificados} certificados
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actividad reciente */}
          <Card className="border-[#dde0d4]/80 shadow-sm animate-fade-in-up stagger-5">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c] mb-4 lg:mb-5">Actividad reciente</h2>
              <div className="flex flex-col items-center py-8 text-center">
                <Activity className="h-8 w-8 text-[#dde0d4] mb-2" aria-hidden="true" />
                <p className="text-sm text-[#7d8471]">Sin actividad reciente</p>
              </div>
            </CardContent>
          </Card>

          {/* Progreso por área */}
          <Card className="border-[#dde0d4]/80 shadow-sm animate-fade-in-up stagger-6">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c] mb-4 lg:mb-5">Progreso por &aacute;rea</h2>
              {areaProgress.length > 0 ? (
                <div className="space-y-4 lg:space-y-6">
                  {areaProgress.map((item) => (
                    <div key={item.area} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1e2d1c]">{item.area}</span>
                        <span className="text-sm font-bold text-[#1e2d1c]">{item.progreso}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-[#f0f2eb] overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-[#2d4a2b]"
                          style={{ width: `${item.progreso}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <TrendingUp className="h-8 w-8 text-[#dde0d4] mb-2" aria-hidden="true" />
                  <p className="text-sm text-[#7d8471]">Sin datos de progreso</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
