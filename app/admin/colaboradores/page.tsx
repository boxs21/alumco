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

export default function ColaboradoresPage() {
  const [selectedSede, setSelectedSede] = useState("global");
  const [sedeTab, setSedeTab] = useState("ALL");

  const collaborators = mockUsers.filter((u) => u.role === "COLLABORATOR");

  const filteredUsers = collaborators.filter((u) => {
    if (sedeTab === "CONCEPCION") return u.sedeId === "s1";
    if (sedeTab === "COYHAIQUE") return u.sedeId === "s2";
    return true;
  });

  const sedeTabs = [
    { key: "ALL", label: "Todas" },
    { key: "CONCEPCION", label: "Concepción" },
    { key: "COYHAIQUE", label: "Coyhaique" },
  ];

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="Colaboradores" />

      <div className="p-6 space-y-6">
        {/* Sede Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1 w-fit">
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

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-sm font-medium text-slate-500">Colaborador</TableHead>
                <TableHead className="text-sm font-medium text-slate-500">Área</TableHead>
                <TableHead className="text-sm font-medium text-slate-500">Sede</TableHead>
                <TableHead className="text-sm font-medium text-slate-500">Estado</TableHead>
                <TableHead className="text-sm font-medium text-slate-500">Progreso</TableHead>
                <TableHead className="text-sm font-medium text-slate-500 text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-medium">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">{user.area}</TableCell>
                  <TableCell>
                    <SedeBadge sedeId={user.sedeId} sedeName={user.sedeName} size="sm" />
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-indigo-500"
                          style={{ width: `${Math.min((user.completadas / 5) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{user.completadas}/5</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/colaboradores/${user.id}`}
                      className="inline-flex items-center h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Ver perfil
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
