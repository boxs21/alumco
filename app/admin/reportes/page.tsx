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

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Filters — 2 cols mobile, 4 cols desktop */}
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
                  {[{ key: "ALL", label: "Todas" }, { key: "CONCEPCION", label: "Conc." }, { key: "COYHAIQUE", label: "Coyh." }].map(
                    (opt) => (
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
                    )
                  )}
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
                  {AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e2d1c]">Desde</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e2d1c]">Hasta</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sede Comparison — 1 col mobile, 2 cols desktop */}
        <Card className="border-[#dde0d4] shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c] mb-4 lg:mb-5">
              Comparativa: {SEDES.CONCEPCION.nombre} vs {SEDES.COYHAIQUE.nombre}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Concepcion */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#2d4a2b]" />
                  <span className="text-sm font-semibold text-[#1e2d1c]">{SEDES.CONCEPCION.nombre}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#f0f2eb]">
                    <p className="text-xl font-semibold text-[#1e2d1c]">{mockStats.CONCEPCION.colaboradores}</p>
                    <p className="text-xs text-[#7d8471]">Colaboradores</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#f0f2eb]">
                    <p className="text-xl font-semibold text-[#1e2d1c]">{mockStats.CONCEPCION.cumplimiento}%</p>
                    <p className="text-xs text-[#7d8471]">Cumplimiento</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#f0f2eb]">
                    <p className="text-xl font-semibold text-[#1e2d1c]">{mockStats.CONCEPCION.capacitaciones}</p>
                    <p className="text-xs text-[#7d8471]">Capacitaciones</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#f0f2eb]">
                    <p className="text-xl font-semibold text-[#1e2d1c]">{mockStats.CONCEPCION.certificados}</p>
                    <p className="text-xs text-[#7d8471]">Certificados</p>
                  </div>
                </div>
              </div>
              {/* Coyhaique */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold text-[#1e2d1c]">{SEDES.COYHAIQUE.nombre}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-xl font-semibold text-[#1e2d1c]">{mockStats.COYHAIQUE.colaboradores}</p>
                    <p className="text-xs text-[#7d8471]">Colaboradores</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-xl font-semibold text-[#1e2d1c]">{mockStats.COYHAIQUE.cumplimiento}%</p>
                    <p className="text-xs text-[#7d8471]">Cumplimiento</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-xl font-semibold text-[#1e2d1c]">{mockStats.COYHAIQUE.capacitaciones}</p>
                    <p className="text-xs text-[#7d8471]">Capacitaciones</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <p className="text-xl font-semibold text-[#1e2d1c]">{mockStats.COYHAIQUE.certificados}</p>
                    <p className="text-xs text-[#7d8471]">Certificados</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Table — scrollable on mobile */}
        <Card className="border-[#dde0d4] shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c]">Detalle por colaborador</h2>
              <button className="inline-flex items-center gap-2 h-9 lg:h-11 px-3 lg:px-5 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb]/60 transition-colors">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar Excel</span>
              </button>
            </div>
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
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-sm font-medium text-[#1e2d1c] whitespace-nowrap">{user.name}</TableCell>
                      <TableCell className="text-sm text-[#1e2d1c] whitespace-nowrap">{user.area}</TableCell>
                      <TableCell>
                        <SedeBadge sedeId={user.sedeId} sedeName={user.sedeName} size="sm" />
                      </TableCell>
                      <TableCell className="text-sm text-[#1e2d1c]">{user.completadas}</TableCell>
                      <TableCell className="text-sm text-[#1e2d1c]">
                        {user.nota ? `${user.nota}%` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.active
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                              : "bg-[#f0f2eb] text-[#7d8471] hover:bg-[#f0f2eb]"
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
