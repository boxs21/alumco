"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import EmptyState from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase";
import { SEDES, AREAS, sedeName } from "@/lib/config";
import { Download, Filter, Users } from "lucide-react";

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  area: string | null;
  sede_id: string | null;
  active: boolean;
}

interface Assignment {
  user_id: string;
  status: string;
}

interface SedeStats {
  colaboradores: number;
  cumplimiento: number;
  capacitaciones: number;
  certificados: number;
}

export default function ReportesPage() {
  const [selectedSede, setSelectedSede] = useState("global");
  const [filterSede, setFilterSede] = useState("ALL");
  const [filterArea, setFilterArea] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [trainingsCount, setTrainingsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo,   setAppliedTo]   = useState("");

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      // Build assignments query with optional date filters
      let assignmentsQuery = supabase.from("assignments").select("user_id, status, created_at");
      if (appliedFrom) assignmentsQuery = assignmentsQuery.gte("created_at", appliedFrom);
      if (appliedTo)   assignmentsQuery = assignmentsQuery.lte("created_at", `${appliedTo}T23:59:59`);

      const [
        { data: profilesData },
        { data: assignmentsData },
        { data: trainingsData },
      ] = await Promise.all([
        supabase.from("profiles").select("id, name, email, area, sede_id, active").eq("role", "COLLABORATOR"),
        assignmentsQuery,
        supabase.from("trainings").select("id, sede_id").eq("status", "PUBLISHED"),
      ]);
      setProfiles(profilesData ?? []);
      setAssignments(assignmentsData ?? []);

      // count published trainings per sede
      const counts: Record<string, number> = { global: 0, s1: 0, s2: 0 };
      for (const t of trainingsData ?? []) {
        counts.global++;
        if (t.sede_id === SEDES.CONCEPCION.id || t.sede_id === null) counts.s1++;
        if (t.sede_id === SEDES.COYHAIQUE.id  || t.sede_id === null) counts.s2++;
      }
      setTrainingsCount(counts);
      setLoading(false);
    }
    load();
  }, [appliedFrom, appliedTo]);

  function computeSedeStats(sedeId: string): SedeStats {
    const sedeProfiles = profiles.filter((p) => p.sede_id === sedeId);
    const profileIds = new Set(sedeProfiles.map((p) => p.id));
    const sedeAssignments = assignments.filter((a) => profileIds.has(a.user_id));
    const total = sedeAssignments.length;
    const completed = sedeAssignments.filter((a) => a.status === "COMPLETED").length;
    return {
      colaboradores: sedeProfiles.filter((p) => p.active).length,
      cumplimiento: total > 0 ? Math.round((completed / total) * 100) : 0,
      capacitaciones: trainingsCount[sedeId] ?? 0,
      certificados: 0, // would need has_certificate in assignments query
    };
  }

  const concStats = computeSedeStats(SEDES.CONCEPCION.id);
  const coyStats  = computeSedeStats(SEDES.COYHAIQUE.id);

  const filteredProfiles = profiles.filter((u) => {
    if (filterSede === "CONCEPCION" && u.sede_id !== SEDES.CONCEPCION.id) return false;
    if (filterSede === "COYHAIQUE"  && u.sede_id !== SEDES.COYHAIQUE.id)  return false;
    if (filterArea !== "ALL" && u.area !== filterArea) return false;
    return true;
  });

  function userStats(userId: string) {
    const ua = assignments.filter((a) => a.user_id === userId);
    const completadas = ua.filter((a) => a.status === "COMPLETED").length;
    return { completadas, avg: null as number | null };
  }

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="Reportes" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Filters */}
        <Card className="border-[#dde0d4] shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <Filter className="h-4 w-4 text-[#a4ac86]" />
              <span className="text-sm font-semibold text-[#1e2d1c]">Filtros</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e2d1c]">Sede</Label>
                <div className="flex rounded-lg bg-[#f0f2eb] p-1">
                  {[
                    { key: "ALL",        label: "Todas" },
                    { key: "CONCEPCION", label: "Conc." },
                    { key: "COYHAIQUE",  label: "Coyh." },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setFilterSede(opt.key)}
                      className={`flex-1 px-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        filterSede === opt.key
                          ? "bg-[#faf9f6] text-[#1e2d1c] shadow-sm"
                          : "text-[#7d8471] hover:text-[#1e2d1c]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e2d1c]">Área</Label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#dde0d4] px-2 text-sm text-[#1e2d1c] bg-[#faf9f6] focus:outline-none focus:ring-2 focus:ring-[#2d4a2b]"
                >
                  <option value="ALL">Todas las áreas</option>
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e2d1c]">Desde</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e2d1c]">Hasta</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#dde0d4]">
              <button
                type="button"
                onClick={() => { setAppliedFrom(dateFrom); setAppliedTo(dateTo); }}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors"
              >
                <Filter className="h-3.5 w-3.5" />
                Aplicar filtros
              </button>
              {(appliedFrom || appliedTo) && (
                <button
                  type="button"
                  onClick={() => { setDateFrom(""); setDateTo(""); setAppliedFrom(""); setAppliedTo(""); }}
                  className="inline-flex items-center h-9 px-4 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm text-[#7d8471] hover:bg-[#f0f2eb] transition-colors"
                >
                  Limpiar
                </button>
              )}
              {(appliedFrom || appliedTo) && (
                <span className="text-xs text-[#7d8471]">
                  Filtrando por fecha
                  {appliedFrom && ` desde ${appliedFrom}`}
                  {appliedTo   && ` hasta ${appliedTo}`}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comparativa */}
        <Card className="border-[#dde0d4] shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c] mb-4 lg:mb-5">
              Comparativa: {SEDES.CONCEPCION.nombre} vs {SEDES.COYHAIQUE.nombre}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {[
                { sede: SEDES.CONCEPCION, s: concStats, dotColor: "bg-[#2d4a2b]", bg: "bg-[#f0f2eb]" },
                { sede: SEDES.COYHAIQUE,  s: coyStats,  dotColor: "bg-amber-500",  bg: "bg-amber-50" },
              ].map(({ sede, s, dotColor, bg }) => (
                <div key={sede.id} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${dotColor}`} />
                    <span className="text-sm font-semibold text-[#1e2d1c]">{sede.nombre}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Colaboradores",  value: s.colaboradores },
                      { label: "Cumplimiento",   value: `${s.cumplimiento}%` },
                      { label: "Capacitaciones", value: s.capacitaciones },
                      { label: "Certificados",   value: s.certificados },
                    ].map(({ label, value }) => (
                      <div key={label} className={`p-3 rounded-lg ${bg}`}>
                        <p className="text-xl font-semibold text-[#1e2d1c]">{value}</p>
                        <p className="text-xs text-[#7d8471]">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail Table */}
        <Card className="border-[#dde0d4] shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c]">Detalle por colaborador</h2>
              <button className="inline-flex items-center gap-2 h-9 lg:h-11 px-3 lg:px-5 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb] transition-colors">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar Excel</span>
              </button>
            </div>

            {loading ? (
              <div className="text-sm text-[#7d8471] py-6 text-center">Cargando...</div>
            ) : filteredProfiles.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Sin colaboradores"
                description="No hay colaboradores que coincidan con los filtros seleccionados."
              />
            ) : (
              <div className="rounded-xl border border-[#dde0d4] overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#faf9f6]">
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Colaborador</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Área</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Sede</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Completadas</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Nota prom.</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((user) => {
                      const { completadas, avg } = userStats(user.id);
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="text-sm font-medium text-[#1e2d1c] whitespace-nowrap">
                            {user.name ?? user.email ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-[#1e2d1c] whitespace-nowrap">{user.area ?? "—"}</TableCell>
                          <TableCell>
                            <SedeBadge sedeId={user.sede_id} sedeName={sedeName(user.sede_id)} size="sm" />
                          </TableCell>
                          <TableCell className="text-sm text-[#1e2d1c]">{completadas}</TableCell>
                          <TableCell className="text-sm text-[#1e2d1c]">{avg != null ? `${avg}%` : "—"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.active
                                  ? "bg-[#f0f2eb] text-[#2d4a2b] hover:bg-[#f0f2eb]"
                                  : "bg-[#f0f2eb] text-[#7d8471] hover:bg-[#f0f2eb]"
                              }
                            >
                              {user.active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
