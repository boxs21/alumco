"use client";

import { useState } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import TrainingCard from "@/components/shared/TrainingCard";
import EmptyState from "@/components/shared/EmptyState";
import { mockTrainings } from "@/lib/mock-data";
import { Plus, BookOpen } from "lucide-react";

export default function CapacitacionesPage() {
  const [selectedSede, setSelectedSede] = useState("global");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sedeTab, setSedeTab] = useState("ALL");

  const filteredTrainings = mockTrainings.filter((t) => {
    if (sedeTab === "CONCEPCION" && t.sedeId !== "s1" && t.sedeId !== null) return false;
    if (sedeTab === "COYHAIQUE" && t.sedeId !== "s2" && t.sedeId !== null) return false;
    if (sedeTab === "CONCEPCION" && t.sedeId === null) return true;
    if (sedeTab === "COYHAIQUE" && t.sedeId === null) return true;
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    return true;
  });

  const sedeTabs = [
    { key: "ALL", label: "Todas" },
    { key: "CONCEPCION", label: "Concepción" },
    { key: "COYHAIQUE", label: "Coyhaique" },
  ];

  const statusOptions = [
    { key: "ALL", label: "Todos" },
    { key: "PUBLISHED", label: "Publicado" },
    { key: "DRAFT", label: "Borrador" },
  ];

  return (
    <div>
      <Topbar
        selectedSede={selectedSede}
        onSedeChange={setSelectedSede}
        title="Capacitaciones"
      />

      <div className="p-6 space-y-6">
        {/* Header with action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Sede Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1">
              {sedeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSedeTab(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    sedeTab === tab.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex rounded-lg bg-slate-100 p-1">
              {statusOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStatusFilter(opt.key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === opt.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/admin/capacitaciones/nueva"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nueva capacitación
          </Link>
        </div>

        {/* Training Grid */}
        {filteredTrainings.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
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
