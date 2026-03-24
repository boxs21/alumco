"use client";

import { useState } from "react";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
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
import { mockUsers, mockStats, SEDES, AREAS } from "@/lib/mock-data";
import { Download, Filter } from "lucide-react";

export default function ReportesPage() {
  const [selectedSede, setSelectedSede] = useState("global");
  const [filterSede, setFilterSede] = useState("ALL");
  const [filterArea, setFilterArea] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const collaborators = mockUsers.filter((u) => u.role === "COLLABORATOR");

  const filteredUsers = collaborators.filter((u) => {
    if (filterSede === "CONCEPCION" && u.sedeId !== "s1") return false;
    if (filterSede === "COYHAIQUE" && u.sedeId !== "s2") return false;
    if (filterArea !== "ALL" && u.area !== filterArea) return false;
    return true;
  });

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="Reportes" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">Filtros</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Sede</Label>
                <div className="flex rounded-lg bg-slate-100 p-1">
                  {[{ key: "ALL", label: "Todas" }, { key: "CONCEPCION", label: "Conc." }, { key: "COYHAIQUE", label: "Coyh." }].map(
                    (opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setFilterSede(opt.key)}
                        className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          filterSede === opt.key
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Área</Label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-base text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Todas las áreas</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Desde</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Hasta</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-11 text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sede Comparison */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              Comparativa: {SEDES.CONCEPCION.nombre} vs {SEDES.COYHAIQUE.nombre}
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {/* Concepcion */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-indigo-500" />
                  <span className="text-sm font-semibold text-slate-900">{SEDES.CONCEPCION.nombre}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-indigo-50">
                    <p className="text-2xl font-semibold text-slate-900">{mockStats.CONCEPCION.colaboradores}</p>
                    <p className="text-sm text-slate-500">Colaboradores</p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-50">
                    <p className="text-2xl font-semibold text-slate-900">{mockStats.CONCEPCION.cumplimiento}%</p>
                    <p className="text-sm text-slate-500">Cumplimiento</p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-50">
                    <p className="text-2xl font-semibold text-slate-900">{mockStats.CONCEPCION.capacitaciones}</p>
                    <p className="text-sm text-slate-500">Capacitaciones</p>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-50">
                    <p className="text-2xl font-semibold text-slate-900">{mockStats.CONCEPCION.certificados}</p>
                    <p className="text-sm text-slate-500">Certificados</p>
                  </div>
                </div>
              </div>
              {/* Coyhaique */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold text-slate-900">{SEDES.COYHAIQUE.nombre}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-2xl font-semibold text-slate-900">{mockStats.COYHAIQUE.colaboradores}</p>
                    <p className="text-sm text-slate-500">Colaboradores</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-2xl font-semibold text-slate-900">{mockStats.COYHAIQUE.cumplimiento}%</p>
                    <p className="text-sm text-slate-500">Cumplimiento</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-2xl font-semibold text-slate-900">{mockStats.COYHAIQUE.capacitaciones}</p>
                    <p className="text-sm text-slate-500">Capacitaciones</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-2xl font-semibold text-slate-900">{mockStats.COYHAIQUE.certificados}</p>
                    <p className="text-sm text-slate-500">Certificados</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Detalle por colaborador</h2>
              <button className="inline-flex items-center gap-2 h-11 px-5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Download className="h-4 w-4" />
                Exportar Excel
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-sm font-medium text-slate-500">Colaborador</TableHead>
                    <TableHead className="text-sm font-medium text-slate-500">Área</TableHead>
                    <TableHead className="text-sm font-medium text-slate-500">Sede</TableHead>
                    <TableHead className="text-sm font-medium text-slate-500">Completadas</TableHead>
                    <TableHead className="text-sm font-medium text-slate-500">Nota promedio</TableHead>
                    <TableHead className="text-sm font-medium text-slate-500">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-sm font-medium text-slate-900">{user.name}</TableCell>
                      <TableCell className="text-sm text-slate-700">{user.area}</TableCell>
                      <TableCell>
                        <SedeBadge sedeId={user.sedeId} sedeName={user.sedeName} size="sm" />
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">{user.completadas}</TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {user.nota ? `${user.nota}%` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.active
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                          }
                        >
                          {user.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
