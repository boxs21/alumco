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

interface Sede {
  id: string;
  nombre: string;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ColaboradoresPage() {
  const [sedeTab, setSedeTab] = useState("ALL");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [
        { data: profilesData, error: profilesError },
        { data: assignmentsData },
        { data: sedesData },
      ] = await Promise.all([
        supabase.from("profiles").select("id, name, email, area, sede_id, active").eq("role", "COLLABORATOR").order("name"),
        supabase.from("assignments").select("user_id, status"),
        supabase.from("sedes").select("id, nombre").order("nombre"),
      ]);
      if (profilesError) {
        // RLS or schema issue — surface the error code so it's visible in console
        throw new Error(`profiles query failed: ${profilesError.code} ${profilesError.message}`);
      }
      setProfiles(profilesData ?? []);
      setAssignments(assignmentsData ?? []);
      setSedes(sedesData ?? []);
      setLoading(false);
    }
    load().catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      setLoading(false);
    });
  }, []);

  // Use real sede IDs from the database, not hardcoded constants
  const filtered = profiles.filter((u) => {
    if (sedeTab === "ALL") return true;
    return u.sede_id === sedeTab;
  });

  function completadas(userId: string) {
    return assignments.filter((a) => a.user_id === userId && a.status === "COMPLETED").length;
  }
  function totalAsignadas(userId: string) {
    return assignments.filter((a) => a.user_id === userId).length;
  }

  function sedeNameLocal(sedeId: string | null): string | null {
    if (!sedeId) return null;
    return sedes.find((s) => s.id === sedeId)?.nombre ?? null;
  }

  const sedeTabs = [
    { key: "ALL", label: "Todas" },
    ...sedes.map((s) => ({ key: s.id, label: s.nombre })),
  ];

  return (
    <div>
      <Topbar title="Colaboradores" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Sede Tabs */}
        <div className="flex rounded-lg bg-[#EEF2FF] p-1 w-fit">
          {sedeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSedeTab(tab.key)}
              className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sedeTab === tab.key
                  ? "bg-[#FAFBFF] text-[#1A2F6B] shadow-sm"
                  : "text-[#6B7AB0] hover:text-[#1A2F6B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-sm text-[#6B7AB0] py-8 text-center">Cargando...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin colaboradores"
            description="No hay colaboradores registrados en esta sede todavía."
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border border-[#C8D4EC] bg-[#FAFBFF] shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#FAFBFF]">
                    <TableHead className="text-sm font-medium text-[#6B7AB0]">Colaborador</TableHead>
                    <TableHead className="text-sm font-medium text-[#6B7AB0]">Área</TableHead>
                    <TableHead className="text-sm font-medium text-[#6B7AB0]">Sede</TableHead>
                    <TableHead className="text-sm font-medium text-[#6B7AB0]">Estado</TableHead>
                    <TableHead className="text-sm font-medium text-[#6B7AB0]">Progreso</TableHead>
                    <TableHead className="text-sm font-medium text-[#6B7AB0] text-right">Acción</TableHead>
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
                              <AvatarFallback className="bg-[#EEF2FF] text-[#1A2F6B] text-xs font-medium">
                                {getInitials(name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-[#1A2F6B]">{name}</p>
                              <p className="text-xs text-[#6B7AB0]">{user.email ?? "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[#1A2F6B]">{user.area ?? "—"}</TableCell>
                        <TableCell>
                          <SedeBadge sedeId={user.sede_id} sedeName={sedeNameLocal(user.sede_id)} size="sm" />
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.active
                                ? "bg-[#EEF2FF] text-[#2B4BA8] hover:bg-[#EEF2FF]"
                                : "bg-[#EEF2FF] text-[#6B7AB0] hover:bg-[#EEF2FF]"
                            }
                          >
                            {user.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-[#EEF2FF]">
                              <div
                                className="h-2 rounded-full bg-[#2B4BA8]"
                                style={{ width: total > 0 ? `${Math.min((done / total) * 100, 100)}%` : "0%" }}
                              />
                            </div>
                            <span className="text-xs text-[#6B7AB0]">{done}/{total}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/admin/colaboradores/${user.id}`}
                            className="inline-flex items-center h-9 px-4 rounded-lg border border-[#C8D4EC] bg-[#FAFBFF] text-sm font-medium text-[#1A2F6B] hover:bg-[#EEF2FF] transition-colors"
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
                  <div key={user.id} className="rounded-xl border border-[#C8D4EC] bg-[#FAFBFF] p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#EEF2FF] text-[#1A2F6B] text-sm font-medium">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-[#1A2F6B]">{name}</p>
                          <p className="text-xs text-[#6B7AB0]">{user.email ?? "—"}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          user.active
                            ? "bg-[#EEF2FF] text-[#2B4BA8] hover:bg-[#EEF2FF] shrink-0"
                            : "bg-[#EEF2FF] text-[#6B7AB0] hover:bg-[#EEF2FF] shrink-0"
                        }
                      >
                        {user.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      {user.area && (
                        <span className="text-xs text-[#6B7AB0] bg-[#EEF2FF] px-2 py-1 rounded-md">{user.area}</span>
                      )}
                      <SedeBadge sedeId={user.sede_id} sedeName={sedeNameLocal(user.sede_id)} size="sm" />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-2 flex-1 max-w-[120px] rounded-full bg-[#EEF2FF]">
                          <div
                            className="h-2 rounded-full bg-[#2B4BA8]"
                            style={{ width: total > 0 ? `${Math.min((done / total) * 100, 100)}%` : "0%" }}
                          />
                        </div>
                        <span className="text-xs text-[#6B7AB0]">{done}/{total} cursos</span>
                      </div>
                      <Link
                        href={`/admin/colaboradores/${user.id}`}
                        className="text-xs font-medium text-[#2B4BA8] hover:text-[#1A2F6B] transition-colors"
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
