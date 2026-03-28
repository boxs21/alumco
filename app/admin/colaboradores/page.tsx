"use client";

import { useState } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockUsers } from "@/lib/mock-data";

/**
 * Página de lista de colaboradores del panel de administración.
 * Muestra una tabla en escritorio y tarjetas en móvil,
 * con filtro por sede y acceso al perfil individual de cada colaborador.
 */
export default function ColaboradoresPage() {
  const [selectedSede, setSelectedSede] = useState("global");
  // Pestaña de sede activa para filtrar la tabla
  const [sedeTab, setSedeTab] = useState("ALL");

  // Excluye administradores de la lista
  const collaborators = mockUsers.filter((u) => u.role === "COLLABORATOR");

  /** Filtra los colaboradores según la sede seleccionada */
  const filteredUsers = collaborators.filter((u) => {
    if (sedeTab === "CONCEPCION") return u.sedeId === "s1";
    if (sedeTab === "COYHAIQUE") return u.sedeId === "s2";
    return true;
  });

  /** Opciones de las pestañas de filtro por sede */
  const sedeTabs = [
    { key: "ALL", label: "Todas" },
    { key: "CONCEPCION", label: "Concepción" },
    { key: "COYHAIQUE", label: "Coyhaique" },
  ];

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="Colaboradores" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Sede Tabs */}
        <div className="flex rounded-lg bg-[#f0f2eb] p-1 w-fit">
          {sedeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSedeTab(tab.key)}
              className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sedeTab === tab.key
                  ? "bg-[#faf9f6] text-[#1e2d1c] shadow-sm"
                  : "text-[#7d8471] hover:text-[#1e2d1c]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-xl border border-[#dde0d4] bg-[#faf9f6] shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#faf9f6]">
                <TableHead className="text-sm font-medium text-[#7d8471]">Colaborador</TableHead>
                <TableHead className="text-sm font-medium text-[#7d8471]">Área</TableHead>
                <TableHead className="text-sm font-medium text-[#7d8471]">Sede</TableHead>
                <TableHead className="text-sm font-medium text-[#7d8471]">Estado</TableHead>
                <TableHead className="text-sm font-medium text-[#7d8471]">Progreso</TableHead>
                <TableHead className="text-sm font-medium text-[#7d8471] text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-[#f0f2eb]/60/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-[#f0f2eb] text-[#1e2d1c] text-xs font-medium">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[#1e2d1c]">{user.name}</p>
                        <p className="text-xs text-[#7d8471]">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#1e2d1c]">{user.area}</TableCell>
                  <TableCell>
                    <SedeBadge sedeId={user.sedeId} sedeName={user.sedeName} size="sm" />
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-[#f0f2eb]">
                        <div
                          className="h-2 rounded-full bg-[#2d4a2b]"
                          style={{ width: `${Math.min((user.completadas / 5) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#7d8471]">{user.completadas}/5</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/colaboradores/${user.id}`}
                      className="inline-flex items-center h-9 px-4 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb]/60 transition-colors"
                    >
                      Ver perfil
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-[#dde0d4] bg-[#faf9f6] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#f0f2eb] text-[#1e2d1c] text-sm font-medium">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-[#1e2d1c]">{user.name}</p>
                    <p className="text-xs text-[#7d8471]">{user.email}</p>
                  </div>
                </div>
                <Badge
                  className={
                    user.active
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 shrink-0"
                      : "bg-[#f0f2eb] text-[#7d8471] hover:bg-[#f0f2eb] shrink-0"
                  }
                >
                  {user.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span className="text-xs text-[#7d8471] bg-[#f0f2eb] px-2 py-1 rounded-md">{user.area}</span>
                <SedeBadge sedeId={user.sedeId} sedeName={user.sedeName} size="sm" />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-2 flex-1 max-w-[120px] rounded-full bg-[#f0f2eb]">
                    <div
                      className="h-2 rounded-full bg-[#2d4a2b]"
                      style={{ width: `${Math.min((user.completadas / 5) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#7d8471]">{user.completadas}/5 cursos</span>
                </div>
                <Link
                  href={`/admin/colaboradores/${user.id}`}
                  className="text-xs font-medium text-[#2d4a2b] hover:text-[#1e2d1c] transition-colors"
                >
                  Ver perfil →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
