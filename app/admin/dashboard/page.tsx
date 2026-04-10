"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/shared/StatCard";
import SedeBadge from "@/components/shared/SedeBadge";
import { Card, CardContent } from "@/components/ui/card";
import { SEDES, SEDE_ID_MAP, sedeName } from "@/lib/config";
import { createClient } from "@/lib/supabase";
import { Users, BookOpen, TrendingUp, Award, Activity } from "lucide-react";

interface Profile {
  id: string;
  sede_id: string | null;
  active: boolean;
}

interface Training {
  id: string;
  area: string;
  sede_id: string | null;
}

interface Assignment {
  user_id: string;
  training_id: string;
  status: string;
  has_certificate: boolean;
}

interface ActivityItem {
  id: string;
  text: string;
  sede_id: string | null;
  sede_name: string | null;
  created_at: string;
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
  selectedSede: string
): SedeStats {
  const sedeId = selectedSede !== "global" ? SEDE_ID_MAP[selectedSede] ?? null : null;

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

  return {
    colaboradores: filteredProfiles.filter((p) => p.active).length,
    capacitaciones: filteredTrainings.length,
    cumplimiento: total > 0 ? Math.round((completed / total) * 100) : 0,
    certificados: filteredAssignments.filter((a) => a.has_certificate).length,
  };
}

export default function DashboardPage() {
  const [selectedSede, setSelectedSede] = useState("global");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const [
        { data: profilesData },
        { data: trainingsData },
        { data: assignmentsData },
        { data: activityData },
      ] = await Promise.all([
        supabase.from("profiles").select("id, sede_id, active").eq("role", "COLLABORATOR"),
        supabase.from("trainings").select("id, area, sede_id").eq("status", "PUBLISHED"),
        supabase.from("assignments").select("user_id, training_id, status, has_certificate"),
        supabase
          .from("activity_log")
          .select("id, text, sede_id, sede_name, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setProfiles(profilesData ?? []);
      setTrainings(trainingsData ?? []);
      setAssignments(assignmentsData ?? []);
      setActivity(activityData ?? []);
    }

    load();
  }, []);

  const stats = computeStats(profiles, trainings, assignments, selectedSede);
  const concStats = computeStats(profiles, trainings, assignments, "CONCEPCION");
  const coyStats = computeStats(profiles, trainings, assignments, "COYHAIQUE");

  // Area progress from published trainings + assignments
  const areaMap: Record<string, { total: number; completed: number }> = {};
  for (const t of trainings) {
    if (!areaMap[t.area]) areaMap[t.area] = { total: 0, completed: 0 };
    const ta = assignments.filter((a) => a.training_id === t.id);
    areaMap[t.area].total += ta.length;
    areaMap[t.area].completed += ta.filter((a) => a.status === "COMPLETED").length;
  }
  const areaProgress = Object.entries(areaMap).map(([area, { total, completed }]) => ({
    area,
    progreso: total > 0 ? Math.round((completed / total) * 100) : 0,
  }));

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="Dashboard" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
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
              {activity.length > 0 ? (
                <div className="space-y-3 lg:space-y-4">
                  {activity.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 animate-fade-in"
                      style={{ animationDelay: `${0.4 + index * 0.08}s` }}
                    >
                      <div className="mt-0.5">
                        <SedeBadge sedeId={item.sede_id} sedeName={item.sede_name} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1e2d1c] leading-snug">{item.text}</p>
                        <p className="text-xs text-[#6b7260] mt-0.5">
                          {new Date(item.created_at).toLocaleDateString("es-CL", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <Activity className="h-8 w-8 text-[#dde0d4] mb-2" aria-hidden="true" />
                  <p className="text-sm text-[#7d8471]">Sin actividad reciente</p>
                </div>
              )}
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
