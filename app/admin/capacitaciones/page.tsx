"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Topbar from "@/components/layout/Topbar";
import TrainingCard from "@/components/shared/TrainingCard";
import EmptyState from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase";
import { SEDES, sedeName } from "@/lib/config";
import { Plus, BookOpen, AlertCircle, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Training {
  id: string;
  title: string;
  target_area: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sede_id: string | null;
}

interface Assignment {
  training_id: string;
  status: string;
}

export default function CapacitacionesPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sedeTab, setSedeTab] = useState("ALL");
  const [areaFilter, setAreaFilter] = useState("ALL");
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Training | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formDeleteError, setFormDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data: trainingsData, error: e1 }, { data: assignmentsData, error: e2 }, { data: areasData }] = await Promise.all([
        supabase.from("trainings").select("id, title, target_area, status, sede_id").order("created_at", { ascending: false }),
        supabase.from("assignments").select("training_id, status"),
        supabase.from("areas").select("name").order("name"),
      ]);
      if (e1 ?? e2) {
        console.error("[capacitaciones] load error:", (e1 ?? e2)?.message);
        setLoadError("No se pudieron cargar las capacitaciones.");
        setLoading(false);
        return;
      }
      setTrainings((trainingsData as Training[]) ?? []);
      setAssignments(assignmentsData ?? []);
      setAreas((areasData ?? []).map((a) => a.name));
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setFormDeleteError(null);
    const supabase = createClient();

    // 1. Limpiar asignaciones
    const { error: e1 } = await supabase.from("assignments").delete().eq("training_id", deleteTarget.id);
    if (e1) {
      console.error("[capacitaciones] delete assignments error:", e1.message);
      setFormDeleteError("No se pudieron eliminar las asignaciones. Intenta de nuevo.");
      setDeleting(false);
      return;
    }

    // 2. Limpiar sesiones (ignora error si no existen)
    await supabase.from("sessions").delete().eq("training_id", deleteTarget.id);
    
    // 3. Limpiar archivos (ignora error si no existen)
    await supabase.from("files").delete().eq("training_id", deleteTarget.id);

    // 4. Limpiar certificados (AQUÍ ATRAPAMOS EL ERROR REAL)
    const { error: certError } = await supabase.from("certificates").delete().eq("training_id", deleteTarget.id);
    if (certError) {
      console.error("[capacitaciones] delete certificates error:", certError.message);
      setFormDeleteError(`Error en DB de Certificados: ${certError.message}`);
      setDeleting(false);
      return; // Detenemos el proceso para que no choque en el siguiente paso
    }

    // 5. Borrar la capacitación final
    const { error: e2 } = await supabase.from("trainings").delete().eq("id", deleteTarget.id);
    if (e2) {
      console.error("[capacitaciones] delete training error:", e2.message);
      setFormDeleteError(`Error en Capacitación: ${e2.message}`);
      setDeleting(false);
      return;
    }

    const deleted = deleteTarget.title;
    setTrainings((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setAssignments((prev) => prev.filter((a) => a.training_id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
    toast.success(`"${deleted}" eliminada correctamente`);
  }

  const filtered = trainings.filter((t) => {
    if (sedeTab === "CONCEPCION" && t.sede_id !== SEDES.CONCEPCION.id && t.sede_id !== null) return false;
    if (sedeTab === "COYHAIQUE" && t.sede_id !== SEDES.COYHAIQUE.id && t.sede_id !== null) return false;
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (areaFilter !== "ALL" && (t.target_area || "Sin área") !== areaFilter) return false;
    return true;
  });

  const AREA_PRIORITY = ["Cuidado", "Enfermería", "Administración"];

  const byArea: Record<string, Training[]> = {};
  for (const t of filtered) {
    const area = t.target_area || "Sin área";
    if (!byArea[area]) byArea[area] = [];
    byArea[area].push(t);
  }
  const areaOrder = [
    ...AREA_PRIORITY.filter((a) => byArea[a]),
    ...Object.keys(byArea).filter((a) => !AREA_PRIORITY.includes(a) && a !== "Sin área"),
    ...(byArea["Sin área"] ? ["Sin área"] : []),
  ];

  const AREA_ACCENT: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    "Cuidado":        { bg: "#ffe6e1", text: "#c0392b", border: "#ffb3a7", dot: "#e86154" },
    "Enfermería":     { bg: "#e4f5e9", text: "#2e7d45", border: "#9fd8ad", dot: "#4caf6e" },
    "Administración": { bg: "#fdf1d8", text: "#7a5200", border: "#f5d68a", dot: "#f2b544" },
    "Sin área":       { bg: "#f0ece4", text: "#6b7185", border: "#e8e4dc", dot: "#a5a9b8" },
  };

  const sedeTabs = [
    { key: "ALL",        label: "Todas" },
    { key: "CONCEPCION", label: SEDES.CONCEPCION.nombre },
    { key: "COYHAIQUE",  label: SEDES.COYHAIQUE.nombre },
  ];

  const statusOptions = [
    { key: "ALL",       label: "Todos" },
    { key: "PUBLISHED", label: "Publicado" },
    { key: "DRAFT",     label: "Borrador" },
  ];

  return (
    <div>
      <Topbar
        title="Capacitaciones"
        sub="Gestiona los cursos, módulos y asignaciones por sede."
      />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header with filters + action */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="flex rounded-lg bg-[#eaf0fb] p-1">
              {sedeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSedeTab(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    sedeTab === tab.key
                      ? "bg-[#f6f3ee] text-[#15182b] shadow-sm"
                      : "text-[#6b7185] hover:text-[#15182b]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex rounded-lg bg-[#eaf0fb] p-1">
              {statusOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStatusFilter(opt.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === opt.key
                      ? "bg-[#f6f3ee] text-[#15182b] shadow-sm"
                      : "text-[#6b7185] hover:text-[#15182b]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  areaFilter !== "ALL"
                    ? "border-[#2d4a8a] bg-[#eaf0fb] text-[#2d4a8a]"
                    : "border-[#e8e4dc] bg-[#f6f3ee] text-[#6b7185] hover:bg-[#eaf0fb]"
                }`}>
                  {areaFilter === "ALL" ? "Área" : areaFilter}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl border-[#e8e4dc] min-w-[160px]">
                <DropdownMenuItem
                  onClick={() => setAreaFilter("ALL")}
                  className={`text-sm rounded-lg ${areaFilter === "ALL" ? "font-semibold text-[#15182b]" : "text-[#6b7185]"}`}
                >
                  Todas las áreas
                </DropdownMenuItem>
                {areas.map((a) => (
                  <DropdownMenuItem
                    key={a}
                    onClick={() => setAreaFilter(a)}
                    className={`text-sm rounded-lg ${areaFilter === a ? "font-semibold text-[#15182b]" : "text-[#6b7185]"}`}
                  >
                    {a}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onClick={() => setAreaFilter("Sin área")}
                  className={`text-sm rounded-lg ${areaFilter === "Sin área" ? "font-semibold text-[#15182b]" : "text-[#6b7185]"}`}
                >
                  Sin área
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Link
            href="/admin/capacitaciones/nueva"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#2d4a8a] text-white text-sm font-medium hover:bg-[#15182b] transition-colors shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nueva capacitaci&oacute;n
          </Link>
        </div>

        {loadError && (
          <div className="px-4 py-3 rounded-xl rounded-xl bg-[#ffe6e1] border border-[#ffccc5] text-[13px] text-[#e86154]">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="text-sm text-[#6b7185] py-8 text-center">Cargando...</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-8">
            {areaOrder.map((area) => {
              const accent = AREA_ACCENT[area] ?? { bg: "#f0ece4", text: "#6b7185", border: "#e8e4dc", dot: "#6b7185" };
              return (
                <div key={area}>
                  {/* Area header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-[700] tracking-[0.04em]"
                      style={{ background: accent.bg, color: accent.text, borderColor: accent.border }}
                    >
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: accent.dot }} />
                      {area}
                    </div>
                    <span className="text-[12px] text-[#a5a9b8]">
                      {byArea[area].length} capacitación{byArea[area].length !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    {byArea[area].map((t, index) => {
                      const ta = assignments.filter((a) => a.training_id === t.id);
                      return (
                        <TrainingCard
                          key={t.id}
                          id={t.id}
                          title={t.title}
                          area={t.target_area}
                          status={t.status}
                          sedeId={t.sede_id}
                          sedeName={sedeName(t.sede_id)}
                          completados={ta.filter((a) => a.status === "COMPLETED").length}
                          asignados={ta.length}
                          delay={index}
                          onDelete={() => setDeleteTarget(t)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Sin capacitaciones"
            description="No hay capacitaciones que coincidan con los filtros seleccionados."
          />
        )}
      </div>
      {/* ── Delete confirmation modal ── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open && !deleting) { setDeleteTarget(null); setFormDeleteError(null); } }}
      >
        <DialogContent className="max-w-sm rounded-2xl border-[#e8e4dc]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-[#15182b] flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              Eliminar capacitación
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <p className="text-sm text-[#6b7185]">
              ¿Estás seguro de que quieres eliminar{" "}
              <span className="font-semibold text-[#15182b]">
                {deleteTarget?.title}
              </span>
              ? Esta acción también eliminará todas sus asignaciones y no se puede deshacer.
            </p>
            {formDeleteError && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-100">{formDeleteError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl border border-[#e8e4dc] bg-[#f6f3ee] text-sm text-[#6b7185] hover:bg-[#eaf0fb] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}