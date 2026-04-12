"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import EmptyState from "@/components/shared/EmptyState";
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
import { createClient } from "@/lib/supabase";
import { SEDES, sedeName } from "@/lib/config";
import { Users } from "lucide-react";

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

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ColaboradoresPage() {
  const [selectedSede, setSelectedSede] = useState("global");
  const [sedeTab, setSedeTab] = useState("ALL");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data: profilesData }, { data: assignmentsData }] = await Promise.all([
        supabase.from("profiles").select("id, name, email, area, sede_id, active").eq("role", "COLLABORATOR"),
        supabase.from("assignments").select("user_id, status"),
      ]);
      setProfiles(profilesData ?? []);
      setAssignments(assignmentsData ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = profiles.filter((u) => {
    if (sedeTab === "CONCEPCION") return u.sede_id === SEDES.CONCEPCION.id;
    if (sedeTab === "COYHAIQUE")  return u.sede_id === SEDES.COYHAIQUE.id;
    return true;
  });

  function completadas(userId: string) {
    return assignments.filter((a) => a.user_id === userId && a.status === "COMPLETED").length;
  }
  function totalAsignadas(userId: string) {
    return assignments.filter((a) => a.user_id === userId).length;
  }

  const sedeTabs = [
    { key: "ALL",       label: "Todas" },
    { key: "CONCEPCION", label: SEDES.CONCEPCION.nombre },
    { key: "COYHAIQUE",  label: SEDES.COYHAIQUE.nombre },
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

        {loading ? (
          <div className="text-sm text-[#7d8471] py-8 text-center">Cargando...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin colaboradores"
            description="No hay colaboradores registrados en esta sede todavía."
          />
        ) : (
          <>
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
                  {filtered.map((user) => {
                    const name = user.name ?? user.email ?? "Sin nombre";
                    const done = completadas(user.id);
                    const total = totalAsignadas(user.id);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-[#f0f2eb] text-[#1e2d1c] text-xs font-medium">
                                {getInitials(name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-[#1e2d1c]">{name}</p>
                              <p className="text-xs text-[#7d8471]">{user.email ?? "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[#1e2d1c]">{user.area ?? "—"}</TableCell>
                        <TableCell>
                          <SedeBadge sedeId={user.sede_id} sedeName={sedeName(user.sede_id)} size="sm" />
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.active
                                ? "bg-[#f0f2eb] text-[#2d4a2b] hover:bg-[#f0f2eb]"
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
                                style={{ width: total > 0 ? `${Math.min((done / total) * 100, 100)}%` : "0%" }}
                              />
                            </div>
                            <span className="text-xs text-[#7d8471]">{done}/{total}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/admin/colaboradores/${user.id}`}
                            className="inline-flex items-center h-9 px-4 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb] transition-colors"
                          >
                            Ver perfil
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((user) => {
                const name = user.name ?? user.email ?? "Sin nombre";
                const done = completadas(user.id);
                const total = totalAsignadas(user.id);
                return (
                  <div key={user.id} className="rounded-xl border border-[#dde0d4] bg-[#faf9f6] p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#f0f2eb] text-[#1e2d1c] text-sm font-medium">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-[#1e2d1c]">{name}</p>
                          <p className="text-xs text-[#7d8471]">{user.email ?? "—"}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          user.active
                            ? "bg-[#f0f2eb] text-[#2d4a2b] hover:bg-[#f0f2eb] shrink-0"
                            : "bg-[#f0f2eb] text-[#7d8471] hover:bg-[#f0f2eb] shrink-0"
                        }
                      >
                        {user.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      {user.area && (
                        <span className="text-xs text-[#7d8471] bg-[#f0f2eb] px-2 py-1 rounded-md">{user.area}</span>
                      )}
                      <SedeBadge sedeId={user.sede_id} sedeName={sedeName(user.sede_id)} size="sm" />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-2 flex-1 max-w-[120px] rounded-full bg-[#f0f2eb]">
                          <div
                            className="h-2 rounded-full bg-[#2d4a2b]"
                            style={{ width: total > 0 ? `${Math.min((done / total) * 100, 100)}%` : "0%" }}
                          />
                        </div>
                        <span className="text-xs text-[#7d8471]">{done}/{total} cursos</span>
                      </div>
                      <Link
                        href={`/admin/colaboradores/${user.id}`}
                        className="text-xs font-medium text-[#2d4a2b] hover:text-[#1e2d1c] transition-colors"
                      >
                        Ver perfil →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
