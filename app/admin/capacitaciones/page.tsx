"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import TrainingCard from "@/components/shared/TrainingCard";
import EmptyState from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase";
import { SEDES, sedeName } from "@/lib/config";
import { Plus, BookOpen } from "lucide-react";

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
  const [selectedSede, setSelectedSede] = useState("global");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sedeTab, setSedeTab] = useState("ALL");
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data: trainingsData }, { data: assignmentsData }] = await Promise.all([
        supabase.from("trainings").select("id, title, target_area, status, sede_id").order("created_at", { ascending: false }),
        supabase.from("assignments").select("training_id, status"),
      ]);
      setTrainings((trainingsData as Training[]) ?? []);
      setAssignments(assignmentsData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = trainings.filter((t) => {
    if (sedeTab === "CONCEPCION" && t.sede_id !== SEDES.CONCEPCION.id && t.sede_id !== null) return false;
    if (sedeTab === "COYHAIQUE" && t.sede_id !== SEDES.COYHAIQUE.id && t.sede_id !== null) return false;
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    return true;
  });

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
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="Capacitaciones" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header with filters + action */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="flex rounded-lg bg-[#f0f2eb] p-1">
              {sedeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSedeTab(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    sedeTab === tab.key
                      ? "bg-[#faf9f6] text-[#1e2d1c] shadow-sm"
                      : "text-[#7d8471] hover:text-[#1e2d1c]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex rounded-lg bg-[#f0f2eb] p-1">
              {statusOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStatusFilter(opt.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === opt.key
                      ? "bg-[#faf9f6] text-[#1e2d1c] shadow-sm"
                      : "text-[#7d8471] hover:text-[#1e2d1c]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/admin/capacitaciones/nueva"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nueva capacitaci&oacute;n
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-[#7d8471] py-8 text-center">Cargando...</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {filtered.map((t, index) => {
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
                />
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
    </div>
  );
}
