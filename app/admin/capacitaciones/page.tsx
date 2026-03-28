"use client";

import { useState } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import TrainingCard from "@/components/shared/TrainingCard";
import EmptyState from "@/components/shared/EmptyState";
import { mockTrainings } from "@/lib/mock-data";
import { Plus, BookOpen } from "lucide-react";

/**
 * Página de lista de capacitaciones del panel de administración.
 * Permite filtrar por sede y estado, y acceder a crear una nueva capacitación.
 */
export default function CapacitacionesPage() {
  const [selectedSede, setSelectedSede] = useState("global");
  const [statusFilter, setStatusFilter] = useState("ALL"); // filtro de estado activo
  const [sedeTab, setSedeTab] = useState("ALL");           // filtro de sede activo

  /**
   * Filtra las capacitaciones según la sede y estado seleccionados.
   * Las capacitaciones globales (sedeId === null) se muestran en cualquier sede.
   */
  const filteredTrainings = mockTrainings.filter((t) => {
    if (sedeTab === "CONCEPCION" && t.sedeId !== "s1" && t.sedeId !== null) return false;
    if (sedeTab === "COYHAIQUE" && t.sedeId !== "s2" && t.sedeId !== null) return false;
    if (sedeTab === "CONCEPCION" && t.sedeId === null) return true;  // globales se muestran en Concepción
    if (sedeTab === "COYHAIQUE" && t.sedeId === null) return true;   // globales se muestran en Coyhaique
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    return true;
  });

  /** Opciones para el filtro por sede */
  const sedeTabs = [
    { key: "ALL", label: "Todas" },
    { key: "CONCEPCION", label: "Concepción" },
    { key: "COYHAIQUE", label: "Coyhaique" },
  ];

  /** Opciones para el filtro por estado de la capacitación */
  const statusOptions = [
    { key: "ALL", label: "Todos" },
    { key: "PUBLISHED", label: "Publicado" },
    { key: "DRAFT", label: "Borrador" },
  ];

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="Capacitaciones" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header with filters + action */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Sede Tabs */}
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

            {/* Status Filter */}
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
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-[#2d4a2b] to-[#4a7c59] text-white text-sm font-medium hover:from-[#1e3a1c] hover:to-[#3d6b4a] transition-all duration-200 shadow-md shadow-[#2d4a2b]/20 active:scale-[0.98] shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nueva capacitaci&oacute;n
          </Link>
        </div>

        {/* Training Grid — 1 col mobile, 2 cols sm, 3 cols lg */}
        {filteredTrainings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {filteredTrainings.map((training, index) => (
              <TrainingCard key={training.id} {...training} delay={index} />
            ))}
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
