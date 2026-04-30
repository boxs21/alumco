"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import EmptyState from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}

export default function ReportesPage() {
  const [filterSede, setFilterSede] = useState("ALL");
  const [filterArea, setFilterArea] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [trainingsCount, setTrainingsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        { data: profilesData, error: e1 },
        { data: assignmentsData, error: e2 },
        { data: trainingsData, error: e3 },
      ] = await Promise.all([
        supabase.from("profiles").select("id, name, email, area, sede_id, active").eq("role", "COLLABORATOR"),
        assignmentsQuery,
        supabase.from("trainings").select("id, sede_id").eq("status", "PUBLISHED"),
      ]);
      if (e1 ?? e2 ?? e3) {
        console.error("[reportes] load error:", (e1 ?? e2 ?? e3)?.message);
        setLoadError("No se pudieron cargar los datos de reportes.");
        setLoading(false);
        return;
      }
      setLoadError(null);
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

  function exportCSV() {
    const date = new Date().toISOString().slice(0, 10);
    const headers = ["Nombre", "Email", "Área", "Sede", "Completadas", "Estado"];
    const rows = filteredProfiles.map((u) => {
      const { completadas } = userStats(u.id);
      return [
        u.name ?? "",
        u.email ?? "",
        u.area ?? "",
        sedeName(u.sede_id) ?? "",
        completadas.toString(),
        u.active ? "Activo" : "Inactivo",
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-alumco-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Topbar
        title="Reportes"
        sub="Indicadores de cumplimiento, certificación y evolución"
        right={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white border border-[#e8e4dc] text-[#15182b] text-[13px] font-[600] hover:bg-[#f7f5f0] transition-colors">
              Período: 2026
            </button>
          </div>
        }
      />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">

        {/* Top cream stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { label: "Colaboradores activos", value: profiles.filter(p => p.active).length, foot: `${profiles.length} en total` },
            { label: "Tasa de cumplimiento",  value: `${(() => { const t = assignments.length; const c = assignments.filter(a => a.status === "COMPLETED").length; return t > 0 ? Math.round((c/t)*100) : 0; })()}%`, foot: "Meta 85%" },
            { label: "Capacitaciones",        value: Object.values(trainingsCount).includes(0) ? Object.keys(trainingsCount).length - 1 : trainingsCount.global ?? 0, foot: "publicadas" },
            { label: "Asignaciones totales",  value: assignments.length, foot: `${assignments.filter(a => a.status === "COMPLETED").length} completadas` },
          ].map((s, i) => (
            <div key={i} className="rounded-[18px] border border-[#e8e4dc] bg-[#f7f5f0] p-4 lg:p-5 shadow-sm animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <p className="text-[11px] font-[700] uppercase tracking-[0.05em] text-[#6b7185] mb-2">{s.label}</p>
              <p className="text-[30px] font-[800] tracking-[-0.03em] tabular-nums text-[#2d4a8a] leading-none">{s.value}</p>
              <p className="text-[11.5px] text-[#a5a9b8] mt-2">{s.foot}</p>
            </div>
          ))}
        </div>

        {loadError && (
          <div className="px-4 py-3 rounded-xl bg-[#ffe6e1] border border-[#ffccc5] text-[13px] text-[#e86154]">
            {loadError}
          </div>
        )}

        {/* Comparativa visual + Filters row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">

          {/* Bar chart comparativa */}
          <Card className="border-[#e8e4dc] shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-[700] text-[#15182b] mb-5">
                Comparativa por sede
              </h2>
              <div className="space-y-6">
                {[
                  { sede: SEDES.CONCEPCION, s: concStats, bar: "bg-[#2d4a8a]", soft: "bg-[#eaf0fb]", dot: "bg-[#2d4a8a]", label: "navy" },
                  { sede: SEDES.COYHAIQUE,  s: coyStats,  bar: "bg-[#f2b544]", soft: "bg-[#fdf1d8]", dot: "bg-[#f2b544]", label: "mustard" },
                ].map(({ sede, s, bar, soft, dot }) => (
                  <div key={sede.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                        <span className="text-[13px] font-[600] text-[#15182b]">{sede.nombre}</span>
                      </div>
                      <span className="text-[15px] font-[800] text-[#15182b] tabular-nums">{s.cumplimiento}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#f0ece4] overflow-hidden">
                      <div className={`h-3 rounded-full ${bar} transition-all duration-700`} style={{ width: `${s.cumplimiento}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Colaboradores", value: s.colaboradores },
                        { label: "Cumplimiento",  value: `${s.cumplimiento}%` },
                        { label: "Capacitaciones",value: s.capacitaciones },
                      ].map(({ label, value }) => (
                        <div key={label} className={`${soft} rounded-xl p-3`}>
                          <p className="text-[16px] font-[800] text-[#15182b] tabular-nums leading-none">{value}</p>
                          <p className="text-[10.5px] text-[#6b7185] mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters card */}
          <Card className="border-[#e8e4dc] shadow-sm">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-[#a5a9b8]" />
                <span className="text-sm font-[700] text-[#15182b]">Filtrar detalle</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-[600] uppercase tracking-wider text-[#a5a9b8]">Sede</Label>
                  <div className="flex rounded-lg bg-[#f0ece4] p-1">
                    {[
                      { key: "ALL",        label: "Todas" },
                      { key: "CONCEPCION", label: "Conc." },
                      { key: "COYHAIQUE",  label: "Coyh." },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setFilterSede(opt.key)}
                        className={`flex-1 px-2 py-1.5 rounded-md text-xs font-[600] transition-colors ${
                          filterSede === opt.key
                            ? "bg-white text-[#15182b] shadow-sm"
                            : "text-[#6b7185] hover:text-[#15182b]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-[600] uppercase tracking-wider text-[#a5a9b8]">Área</Label>
                  <select
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#e8e4dc] px-3 text-sm text-[#15182b] bg-[#f6f3ee] focus:outline-none focus:ring-2 focus:ring-[#2d4a8a]"
                  >
                    <option value="ALL">Todas las áreas</option>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-[600] uppercase tracking-wider text-[#a5a9b8]">Desde</Label>
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 text-sm rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-[600] uppercase tracking-wider text-[#a5a9b8]">Hasta</Label>
                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 text-sm rounded-xl" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setAppliedFrom(dateFrom); setAppliedTo(dateTo); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-[#2d4a8a] text-white text-sm font-[600] hover:bg-[#15182b] transition-colors"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Aplicar
                  </button>
                  {(appliedFrom || appliedTo) && (
                    <button
                      type="button"
                      onClick={() => { setDateFrom(""); setDateTo(""); setAppliedFrom(""); setAppliedTo(""); }}
                      className="h-10 px-3 rounded-xl border border-[#e8e4dc] bg-[#f6f3ee] text-sm text-[#6b7185] hover:bg-[#eaf0fb] transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                {(appliedFrom || appliedTo) && (
                  <p className="text-[11px] text-[#6b7185]">
                    Filtrando{appliedFrom && ` desde ${appliedFrom}`}{appliedTo && ` hasta ${appliedTo}`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail Table */}
        <Card className="border-[#e8e4dc] shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm lg:text-base font-[700] text-[#15182b]">Detalle por colaborador</h2>
              <button
                onClick={exportCSV}
                disabled={filteredProfiles.length === 0}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-[#e8e4dc] bg-[#f6f3ee] text-sm font-[600] text-[#15182b] hover:bg-[#eaf0fb] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>
            </div>

            {loading ? (
              <div className="text-sm text-[#6b7185] py-6 text-center">Cargando...</div>
            ) : filteredProfiles.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Sin colaboradores"
                description="No hay colaboradores que coincidan con los filtros seleccionados."
              />
            ) : (
              <div className="rounded-xl border border-[#e8e4dc] overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f6f3ee] border-b border-[#e8e4dc]">
                      <TableHead className="text-[11px] font-[700] uppercase tracking-wider text-[#a5a9b8] whitespace-nowrap">Colaborador</TableHead>
                      <TableHead className="text-[11px] font-[700] uppercase tracking-wider text-[#a5a9b8] whitespace-nowrap">Área</TableHead>
                      <TableHead className="text-[11px] font-[700] uppercase tracking-wider text-[#a5a9b8] whitespace-nowrap">Sede</TableHead>
                      <TableHead className="text-[11px] font-[700] uppercase tracking-wider text-[#a5a9b8] whitespace-nowrap">Completadas</TableHead>
                      <TableHead className="text-[11px] font-[700] uppercase tracking-wider text-[#a5a9b8] whitespace-nowrap">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((user) => {
                      const { completadas } = userStats(user.id);
                      return (
                        <TableRow key={user.id} className="hover:bg-[#f7f5f0] border-b border-[#f0ece4]">
                          <TableCell className="text-sm font-[600] text-[#15182b] whitespace-nowrap">
                            {user.name ?? user.email ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-[#6b7185] whitespace-nowrap">{user.area ?? "—"}</TableCell>
                          <TableCell>
                            <SedeBadge sedeId={user.sede_id} sedeName={sedeName(user.sede_id)} size="sm" />
                          </TableCell>
                          <TableCell className="text-sm font-[600] tabular-nums text-[#15182b]">{completadas}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-[600] ${
                              user.active
                                ? "bg-[#dbeee3] text-[#1a6a43]"
                                : "bg-[#f0ece4] text-[#a5a9b8]"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${user.active ? "bg-[#3c9d70]" : "bg-[#a5a9b8]"}`} />
                              {user.active ? "Activo" : "Inactivo"}
                            </span>
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
