"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Topbar from "@/components/layout/Topbar";
import TrainingCard from "@/components/shared/TrainingCard";
import EmptyState from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase";
import { SEDES, sedeName } from "@/lib/config";
import { Plus, BookOpen, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Training {
  id: string;
  title: string;
  target_area: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sede_id: string | null;
}

interface Assignment { training_id: string; status: string }

export default function ProfesorCapacitacionesPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sedeTab, setSedeTab] = useState("ALL");
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Training | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formDeleteError, setFormDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data: trainingsData, error: e1 }, { data: assignmentsData, error: e2 }] = await Promise.all([
        supabase.from("trainings").select("id, title, target_area, status, sede_id").order("created_at", { ascending: false }),
        supabase.from("assignments").select("training_id, status"),
      ]);
      if (e1 ?? e2) { setLoadError("No se pudieron cargar las capacitaciones."); setLoading(false); return; }
      setTrainings((trainingsData as Training[]) ?? []);
      setAssignments(assignmentsData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setFormDeleteError(null);
    const supabase = createClient();
    const { error: e1 } = await supabase.from("assignments").delete().eq("training_id", deleteTarget.id);
    if (e1) { setFormDeleteError("No se pudieron eliminar las asignaciones."); setDeleting(false); return; }
    await supabase.from("sessions").delete().eq("training_id", deleteTarget.id);
    await supabase.from("files").delete().eq("training_id", deleteTarget.id);
    const { error: certError } = await supabase.from("certificates").delete().eq("training_id", deleteTarget.id);
    if (certError) { setFormDeleteError(`Error en certificados: ${certError.message}`); setDeleting(false); return; }
    const { error: e2 } = await supabase.from("trainings").delete().eq("id", deleteTarget.id);
    if (e2) { setFormDeleteError(`Error: ${e2.message}`); setDeleting(false); return; }
    const deleted = deleteTarget.title;
    setTrainings((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setAssignments((prev) => prev.filter((a) => a.training_id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
    toast.success(`"${deleted}" eliminada correctamente`);
  }

  const filtered = trainings.filter((t) => {
    if (sedeTab === "CONCEPCION" && t.sede_id !== SEDES.CONCEPCION.id && t.sede_id !== null) return false;
    if (sedeTab === "COYHAIQUE"  && t.sede_id !== SEDES.COYHAIQUE.id  && t.sede_id !== null) return false;
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <Topbar title="Capacitaciones" />
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="flex rounded-lg bg-[#EEF2FF] p-1">
              {[
                { key: "ALL",        label: "Todas" },
                { key: "CONCEPCION", label: SEDES.CONCEPCION.nombre },
                { key: "COYHAIQUE",  label: SEDES.COYHAIQUE.nombre },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setSedeTab(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    sedeTab === tab.key ? "bg-[#FAFBFF] text-[#1A2F6B] shadow-sm" : "text-[#6B7AB0] hover:text-[#1A2F6B]"
                  }`}
                >{tab.label}</button>
              ))}
            </div>
            <div className="flex rounded-lg bg-[#EEF2FF] p-1">
              {[
                { key: "ALL",       label: "Todos" },
                { key: "PUBLISHED", label: "Publicado" },
                { key: "DRAFT",     label: "Borrador" },
              ].map((opt) => (
                <button key={opt.key} onClick={() => setStatusFilter(opt.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === opt.key ? "bg-[#FAFBFF] text-[#1A2F6B] shadow-sm" : "text-[#6B7AB0] hover:text-[#1A2F6B]"
                  }`}
                >{opt.label}</button>
              ))}
            </div>
          </div>
          <Link
            href="/profesor/capacitaciones/nueva"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#2B4BA8] text-white text-sm font-medium hover:bg-[#1A2F6B] transition-colors shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nueva capacitación
          </Link>
        </div>

        {loadError && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{loadError}</div>
        )}

        {loading ? (
          <div className="text-sm text-[#6B7AB0] py-8 text-center">Cargando...</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {filtered.map((t, index) => {
              const ta = assignments.filter((a) => a.training_id === t.id);
              return (
                <TrainingCard
                  key={t.id}
                  id={t.id}
                  href={`/profesor/capacitaciones/${t.id}`}
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
        ) : (
          <EmptyState icon={BookOpen} title="Sin capacitaciones" description="No hay capacitaciones que coincidan con los filtros." />
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open && !deleting) { setDeleteTarget(null); setFormDeleteError(null); } }}>
        <DialogContent className="max-w-sm rounded-2xl border-[#C8D4EC]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-[#1A2F6B] flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              Eliminar capacitación
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <p className="text-sm text-[#6B7AB0]">
              ¿Estás seguro de eliminar{" "}
              <span className="font-semibold text-[#1A2F6B]">{deleteTarget?.title}</span>? Esta acción no se puede deshacer.
            </p>
            {formDeleteError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-100">{formDeleteError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 h-10 rounded-xl border border-[#C8D4EC] bg-[#FAFBFF] text-sm text-[#6B7AB0] hover:bg-[#EEF2FF] transition-colors disabled:opacity-50"
              >Cancelar</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 h-10 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >{deleting ? "Eliminando..." : "Eliminar"}</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
