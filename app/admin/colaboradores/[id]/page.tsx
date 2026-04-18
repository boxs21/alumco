"use client";

import { use, useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
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
  name: string | null;
  email: string | null;
  area: string | null;
  sede_id: string | null;
  active: boolean;
}

interface Assignment {
  id: string;
  training_id: string;
  status: string;
  trainings: { title: string }[] | { title: string } | null;
}

interface Certificate {
  id: string;
  training_id: string;
  pdf_url: string | null;
  issued_at: string | null;
  trainings: { title: string }[] | { title: string } | null;
}

interface Attempt {
  training_id: string;
  score: number | null;
  quizzes: { training_id: string }[] | { training_id: string } | null;
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

export default function ColaboradorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [
        { data: profileData },
        { data: assignmentsData },
        { data: certsData },
        { data: attemptsData },
      ] = await Promise.all([
        supabase.from("profiles").select("id, name, email, area, sede_id, active").eq("id", id).single(),
        supabase.from("assignments").select("id, training_id, status, trainings(title)").eq("user_id", id),
        supabase.from("certificates").select("id, training_id, pdf_url, issued_at, trainings(title)").eq("user_id", id),
        supabase.from("attempts").select("score, quizzes(training_id)").eq("user_id", id),
      ]);
      setProfile(profileData ?? null);
      setAssignments(((assignmentsData ?? []) as unknown) as Assignment[]);
      setCerts(((certsData ?? []) as unknown) as Certificate[]);
      setAttempts(((attemptsData ?? []) as unknown) as Attempt[]);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Topbar title="Colaborador" sub="Cargando…" />
        <div className="p-6 text-sm text-[#6b7185]">Cargando...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Topbar title="Colaborador" sub="No se pudo cargar." />
        <div className="p-6 text-sm text-[#6b7185]">Colaborador no encontrado.</div>
      </div>
    );
  }

  const name = profile.name ?? profile.email ?? "Sin nombre";
  const initials = getInitials(name);
  const palette = avatarPalette(name);
  const completed = assignments.filter((a) => a.status === "COMPLETED");

  // Best score per training from attempts
  function scoreForTraining(trainingId: string): number | null {
    const ta = attempts.filter((a) => {
      const q = Array.isArray(a.quizzes) ? a.quizzes[0] : a.quizzes;
      return q?.training_id === trainingId;
    });
    const scores = ta.map((a) => a.score).filter((s): s is number => s !== null);
    return scores.length > 0 ? Math.max(...scores) : null;
  }

  const allScores = attempts.map((a) => a.score).filter((s): s is number => s !== null);
  const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;

  return (
    <div>
      <Topbar
        title={name}
        sub={`${profile.area ?? "Sin área"} · ${profile.active ? "Activo" : "Inactivo"}`}
      />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={`h-14 w-14 lg:h-16 lg:w-16 rounded-[16px] flex items-center justify-center text-[18px] lg:text-[20px] font-[800] shrink-0 ${palette.bg} ${palette.text}`}>
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <h1 className="text-xl lg:text-2xl font-[800] tracking-[-0.025em] text-[#15182b]">{name}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-[700] ${
                profile.active ? "bg-[#dbeee3] text-[#1a6a43]" : "bg-[#f0ece4] text-[#a5a9b8]"
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {profile.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#6b7185]">
              {profile.area && <span>{profile.area}</span>}
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">{profile.email ?? "—"}</span>
              <SedeBadge sedeId={profile.sede_id} sedeName={sedeName(profile.sede_id)} size="sm" />
            </div>
            <p className="sm:hidden text-xs text-[#6b7185]">{profile.email ?? "—"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard title="Asignadas"    value={assignments.length}                  icon={BookOpen}  variant="navy" />
          <StatCard title="Completadas"  value={completed.length}                    icon={CheckCircle} variant="default" />
          <StatCard title="Nota promedio" value={avgScore !== null ? `${avgScore}%` : "—"} icon={Star} variant="coral" />
          <StatCard title="Certificados" value={certs.length}                        icon={Award}     variant="mustard" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trainings">
          <TabsList className="bg-[#eaf0fb]">
            <TabsTrigger value="trainings" className="text-sm">Capacitaciones</TabsTrigger>
            <TabsTrigger value="certificates" className="text-sm">Certificados</TabsTrigger>
          </TabsList>

          <TabsContent value="trainings" className="mt-4">
            {assignments.length === 0 ? (
              <p className="text-sm text-[#6b7185] py-6 text-center">Sin capacitaciones asignadas.</p>
            ) : (
              <div className="rounded-xl border border-[#e8e4dc] bg-[#f6f3ee] shadow-sm overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f6f3ee]">
                      <TableHead className="text-sm font-medium text-[#6b7185] whitespace-nowrap">Capacitación</TableHead>
                      <TableHead className="text-sm font-medium text-[#6b7185] whitespace-nowrap">Estado</TableHead>
                      <TableHead className="text-sm font-medium text-[#6b7185] whitespace-nowrap">Nota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((a) => {
                      const title = (Array.isArray(a.trainings) ? a.trainings[0]?.title : a.trainings?.title) ?? "—";
                      const s = scoreForTraining(a.training_id);
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="text-sm font-medium text-[#15182b]">{title}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-[700] ${
                              a.status === "COMPLETED" ? "bg-[#dbeee3] text-[#1a6a43]" : "bg-[#eaf0fb] text-[#2d4a8a]"
                            }`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                              {a.status === "COMPLETED" ? "Completado" : "En progreso"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-[#15182b]">
                            {s != null ? `${s}%` : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="certificates" className="mt-4">
            {certs.length === 0 ? (
              <p className="text-sm text-[#6b7185] py-6 text-center">Sin certificados obtenidos.</p>
            ) : (
              <div className="rounded-xl border border-[#e8e4dc] bg-[#f6f3ee] shadow-sm overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f6f3ee]">
                      <TableHead className="text-sm font-medium text-[#6b7185] whitespace-nowrap">Capacitación</TableHead>
                      <TableHead className="text-sm font-medium text-[#6b7185] whitespace-nowrap">Fecha</TableHead>
                      <TableHead className="text-sm font-medium text-[#6b7185] text-right whitespace-nowrap">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certs.map((c) => {
                      const title = (Array.isArray(c.trainings) ? c.trainings[0]?.title : c.trainings?.title) ?? "—";
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="text-sm font-medium text-[#15182b]">{title}</TableCell>
                          <TableCell className="text-sm text-[#6b7185] whitespace-nowrap">
                            {c.issued_at ? new Date(c.issued_at).toLocaleDateString("es-CL") : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {c.pdf_url ? (
                              <a
                                href={c.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#e8e4dc] bg-[#f6f3ee] text-sm font-medium text-[#15182b] hover:bg-[#eaf0fb] transition-colors"
                              >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Descargar</span>
                              </a>
                            ) : (
                              <button disabled className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#e8e4dc] bg-[#f6f3ee] text-sm font-medium text-[#a5a9b8] opacity-50 cursor-not-allowed">
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Descargar</span>
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
