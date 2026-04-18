"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import EmptyState from "@/components/shared/EmptyState";
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

const AVATAR_PALETTES = [
  { bg: "bg-[#ff7c6b]", text: "text-white" },
  { bg: "bg-[#2d4a8a]", text: "text-white" },
  { bg: "bg-[#f2b544]", text: "text-[#4a3410]" },
  { bg: "bg-[#3c9d70]", text: "text-white" },
];

function avatarPalette(name: string) {
  const code = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_PALETTES[code % AVATAR_PALETTES.length];
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
      <Topbar
        title="Colaboradores"
        sub={`${profiles.length} personas · 2 sedes`}
        right={
          <Link
            href="/admin/personal"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
          >
            <span className="text-base leading-none">+</span> Invitar colaborador
          </Link>
        }
      />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Sede Tabs */}
        <div className="flex rounded-lg bg-[#eaf0fb] p-1 w-fit">
          {sedeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSedeTab(tab.key)}
              className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sedeTab === tab.key
                  ? "bg-[#f6f3ee] text-[#15182b] shadow-sm"
                  : "text-[#6b7185] hover:text-[#15182b]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-sm text-[#6b7185] py-8 text-center">Cargando...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin colaboradores"
            description="No hay colaboradores registrados en esta sede todavía."
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border border-[#e8e4dc] bg-[#f6f3ee] shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f6f3ee]">
                    <TableHead className="text-sm font-medium text-[#6b7185]">Colaborador</TableHead>
                    <TableHead className="text-sm font-medium text-[#6b7185]">Área</TableHead>
                    <TableHead className="text-sm font-medium text-[#6b7185]">Sede</TableHead>
                    <TableHead className="text-sm font-medium text-[#6b7185]">Estado</TableHead>
                    <TableHead className="text-sm font-medium text-[#6b7185]">Progreso</TableHead>
                    <TableHead className="text-sm font-medium text-[#6b7185] text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => {
                    const name = user.name ?? user.email ?? "Sin nombre";
                    const done = completadas(user.id);
                    const total = totalAsignadas(user.id);
                    const pct = total > 0 ? Math.min((done / total) * 100, 100) : 0;
                    const palette = avatarPalette(name);
                    const barColor = done === total && total > 0 ? "bg-[#3c9d70]" : "bg-[#2d4a8a]";
                    return (
                      <TableRow key={user.id} className="hover:bg-[#f7f5f0]">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-[12px] flex items-center justify-center text-xs font-[700] flex-shrink-0 ${palette.bg} ${palette.text}`}>
                              {getInitials(name)}
                            </div>
                            <div>
                              <p className="text-sm font-[600] text-[#15182b]">{name}</p>
                              <p className="text-xs text-[#6b7185]">{user.email ?? "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[#6b7185]">{user.area ?? "—"}</TableCell>
                        <TableCell>
                          <SedeBadge sedeId={user.sede_id} sedeName={sedeNameLocal(user.sede_id)} size="sm" />
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-[600] ${
                            user.active
                              ? "bg-[#dbeee3] text-[#1a6a43]"
                              : "bg-[#f0ece4] text-[#a5a9b8]"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${user.active ? "bg-[#3c9d70]" : "bg-[#a5a9b8]"}`} />
                            {user.active ? "Activo" : "Inactivo"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-[#f0ece4] overflow-hidden">
                              <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs tabular-nums text-[#6b7185]">{done}/{total}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/admin/colaboradores/${user.id}`}
                            className="inline-flex items-center h-8 px-3 rounded-lg border border-[#e8e4dc] bg-[#f6f3ee] text-xs font-[600] text-[#15182b] hover:bg-[#eaf0fb] transition-colors"
                          >
                            Ver perfil →
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
                const pct = total > 0 ? Math.min((done / total) * 100, 100) : 0;
                const palette = avatarPalette(name);
                const barColor = done === total && total > 0 ? "bg-[#3c9d70]" : "bg-[#2d4a8a]";
                return (
                  <div key={user.id} className="rounded-xl border border-[#e8e4dc] bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-[12px] flex items-center justify-center text-sm font-[700] flex-shrink-0 ${palette.bg} ${palette.text}`}>
                          {getInitials(name)}
                        </div>
                        <div>
                          <p className="text-sm font-[600] text-[#15182b]">{name}</p>
                          <p className="text-xs text-[#6b7185]">{user.email ?? "—"}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-[600] shrink-0 ${
                        user.active ? "bg-[#dbeee3] text-[#1a6a43]" : "bg-[#f0ece4] text-[#a5a9b8]"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.active ? "bg-[#3c9d70]" : "bg-[#a5a9b8]"}`} />
                        {user.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {user.area && (
                        <span className="text-xs text-[#6b7185] bg-[#f0ece4] px-2 py-0.5 rounded-md">{user.area}</span>
                      )}
                      <SedeBadge sedeId={user.sede_id} sedeName={sedeNameLocal(user.sede_id)} size="sm" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-2 flex-1 max-w-[120px] rounded-full bg-[#f0ece4] overflow-hidden">
                          <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-[#6b7185]">{done}/{total} cursos</span>
                      </div>
                      <Link
                        href={`/admin/colaboradores/${user.id}`}
                        className="text-xs font-[600] text-[#2d4a8a] hover:text-[#15182b] transition-colors"
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
