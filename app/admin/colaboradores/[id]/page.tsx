"use client";

import { use, useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase";
import { sedeName } from "@/lib/config";
import { BookOpen, CheckCircle, Star, Award, Download } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  area: string | null;
  sede_id: string | null;
  active: boolean;
}

interface Assignment {
  id: string;
  training_id: string;
  status: string;
  score: number | null;
  completed_at: string | null;
  has_certificate: boolean;
  // Supabase returns embedded relations as arrays
  trainings: { title: string }[] | { title: string } | null;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ColaboradorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedSede, setSelectedSede] = useState("global");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data: profileData }, { data: assignmentsData }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, area, sede_id, active").eq("id", id).single(),
        supabase
          .from("assignments")
          .select("id, training_id, status, score, completed_at, has_certificate, trainings(title)")
          .eq("user_id", id),
      ]);
      setProfile(profileData ?? null);
      setAssignments(((assignmentsData ?? []) as unknown) as Assignment[]);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="" />
        <div className="p-6 text-sm text-[#7d8471]">Cargando...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="" />
        <div className="p-6 text-sm text-[#7d8471]">Colaborador no encontrado.</div>
      </div>
    );
  }

  const name = profile.full_name ?? profile.email ?? "Sin nombre";
  const initials = getInitials(name);
  const completed = assignments.filter((a) => a.status === "COMPLETED");
  const certificates = completed.filter((a) => a.has_certificate);
  const scores = completed.map((a) => a.score).filter((s): s is number => s !== null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="h-14 w-14 lg:h-16 lg:w-16">
            <AvatarFallback className="bg-[#f0f2eb] text-[#1e2d1c] text-lg lg:text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <h1 className="text-xl lg:text-2xl font-semibold text-[#1e2d1c]">{name}</h1>
              <Badge
                className={
                  profile.active
                    ? "bg-[#f0f2eb] text-[#2d4a2b] hover:bg-[#f0f2eb]"
                    : "bg-[#f0f2eb] text-[#7d8471] hover:bg-[#f0f2eb]"
                }
              >
                {profile.active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#7d8471]">
              {profile.area && <span>{profile.area}</span>}
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">{profile.email ?? "—"}</span>
              <SedeBadge sedeId={profile.sede_id} sedeName={sedeName(profile.sede_id)} size="sm" />
            </div>
            <p className="sm:hidden text-xs text-[#7d8471]">{profile.email ?? "—"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard title="Asignadas" value={assignments.length} icon={BookOpen} />
          <StatCard title="Completadas" value={completed.length} icon={CheckCircle} />
          <StatCard title="Nota promedio" value={avgScore !== null ? `${avgScore}%` : "—"} icon={Star} />
          <StatCard title="Certificados" value={certificates.length} icon={Award} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trainings">
          <TabsList className="bg-[#f0f2eb]">
            <TabsTrigger value="trainings" className="text-sm">Capacitaciones</TabsTrigger>
            <TabsTrigger value="certificates" className="text-sm">Certificados</TabsTrigger>
          </TabsList>

          <TabsContent value="trainings" className="mt-4">
            {assignments.length === 0 ? (
              <p className="text-sm text-[#7d8471] py-6 text-center">Sin capacitaciones asignadas.</p>
            ) : (
              <div className="rounded-xl border border-[#dde0d4] bg-[#faf9f6] shadow-sm overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#faf9f6]">
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Capacitación</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Estado</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Nota</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm font-medium text-[#1e2d1c]">
                          {(Array.isArray(a.trainings) ? a.trainings[0]?.title : a.trainings?.title) ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              a.status === "COMPLETED"
                                ? "bg-[#f0f2eb] text-[#2d4a2b] hover:bg-[#f0f2eb]"
                                : "bg-[#fff8e8] text-[#9a6800] hover:bg-[#fff8e8]"
                            }
                          >
                            {a.status === "COMPLETED" ? "Completado" : "En progreso"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-[#1e2d1c]">
                          {a.score != null ? `${a.score}%` : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-[#7d8471] whitespace-nowrap">
                          {a.completed_at ? new Date(a.completed_at).toLocaleDateString("es-CL") : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="certificates" className="mt-4">
            {certificates.length === 0 ? (
              <p className="text-sm text-[#7d8471] py-6 text-center">Sin certificados obtenidos.</p>
            ) : (
              <div className="rounded-xl border border-[#dde0d4] bg-[#faf9f6] shadow-sm overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#faf9f6]">
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Capacitación</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Nota</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] whitespace-nowrap">Fecha</TableHead>
                      <TableHead className="text-sm font-medium text-[#7d8471] text-right whitespace-nowrap">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm font-medium text-[#1e2d1c]">
                          {(Array.isArray(a.trainings) ? a.trainings[0]?.title : a.trainings?.title) ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-[#1e2d1c]">
                          {a.score != null ? `${a.score}%` : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-[#7d8471] whitespace-nowrap">
                          {a.completed_at ? new Date(a.completed_at).toLocaleDateString("es-CL") : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb] transition-colors">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Descargar</span>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
