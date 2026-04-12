"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";
import { sedeName } from "@/lib/config";
import {
  Users,
  CheckCircle,
  TrendingUp,
  FileText,
  Video,
  Presentation,
  ClipboardList,
  UserPlus,
  ChevronRight,
} from "lucide-react";

interface Training {
  id: string;
  title: string;
  target_area: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sede_id: string | null;
  passing_score: number | null;
  max_attempts: number | null;
}

interface TrainingFile {
  id: string;
  name: string;
  type: string;
  size_label: string | null;
  url: string | null;
}

interface TrainingQuestion {
  id: string;
}

interface AssignmentProfile {
  full_name: string | null;
  email: string | null;
  area: string | null;
  sede_id: string | null;
}

interface Assignment {
  id: string;
  user_id: string;
  status: string;
  // Supabase returns embedded relations as arrays even for many-to-one
  profiles: AssignmentProfile[] | AssignmentProfile | null;
}

const fileTypeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  VIDEO: Video,
  PRESENTATION: Presentation,
};

const statusConfig = {
  DRAFT:     { label: "Borrador",  className: "bg-[#f0f2eb] text-[#7d8471]" },
  PUBLISHED: { label: "Publicado", className: "bg-[#f0f2eb] text-[#2d4a2b]" },
  ARCHIVED:  { label: "Archivado", className: "bg-[#fdf0ec] text-[#b74729]" },
};

export default function CapacitacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedSede, setSelectedSede] = useState("global");
  const [training, setTraining] = useState<Training | null>(null);
  const [files, setFiles] = useState<TrainingFile[]>([]);
  const [questions, setQuestions] = useState<TrainingQuestion[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [
        { data: trainingData },
        { data: filesData },
        { data: questionsData },
        { data: assignmentsData },
      ] = await Promise.all([
        supabase
          .from("trainings")
          .select("id, title, target_area, status, sede_id, passing_score, max_attempts")
          .eq("id", id)
          .single(),
        supabase.from("training_files").select("id, name, type, size_label, url").eq("training_id", id),
        supabase.from("training_questions").select("id").eq("training_id", id),
        supabase
          .from("assignments")
          .select("id, user_id, status, profiles(full_name, email, area, sede_id)")
          .eq("training_id", id),
      ]);
      setTraining(trainingData as Training | null);
      setFiles(filesData ?? []);
      setQuestions(questionsData ?? []);
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

  if (!training) {
    return (
      <div>
        <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="" />
        <div className="p-6 text-sm text-[#7d8471]">Capacitación no encontrada.</div>
      </div>
    );
  }

  const statusInfo = statusConfig[training.status] ?? statusConfig.DRAFT;
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#6b7260]">
          <Link href="/admin/capacitaciones" className="hover:text-[#1e2d1c] transition-colors">
            Capacitaciones
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#1e2d1c] font-medium truncate max-w-[200px] sm:max-w-none">{training.title}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <h1 className="text-xl lg:text-2xl font-semibold text-[#1e2d1c]">{training.title}</h1>
              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <SedeBadge sedeId={training.sede_id} sedeName={sedeName(training.sede_id)} />
              <span className="text-sm text-[#6b7260]">&Aacute;rea: {training.target_area}</span>
            </div>
          </div>
          <Link
            href={`/admin/capacitaciones/${id}/asignar`}
            className="inline-flex items-center justify-center gap-2 h-10 lg:h-11 px-4 lg:px-5 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            Asignar colaboradores
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
          <StatCard title="Asignados" value={total} icon={Users} />
          <StatCard title="Completados" value={completed} icon={CheckCircle} />
          <StatCard title="Cumplimiento" value={`${progress}%`} icon={TrendingUp} />
        </div>

        {/* Material + Quiz */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c] mb-3 lg:mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#a4ac86]" aria-hidden="true" />
                Material formativo
              </h2>
              {files.length === 0 ? (
                <p className="text-sm text-[#7d8471]">Sin archivos cargados.</p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => {
                    const FileIcon = fileTypeIcons[file.type] ?? FileText;
                    return (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#dde0d4]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2eb]">
                          <FileIcon className="h-4 w-4 text-[#6b7260]" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1e2d1c] truncate">{file.name}</p>
                          {file.size_label && <p className="text-xs text-[#6b7260]">{file.size_label}</p>}
                          {file.type === "VIDEO" && file.url && (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#4a7c59] hover:underline truncate block"
                            >
                              {file.url}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c] mb-3 lg:mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#a4ac86]" aria-hidden="true" />
                Evaluaci&oacute;n
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b7260]">Preguntas</span>
                  <span className="font-medium text-[#1e2d1c]">{questions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b7260]">Nota m&iacute;nima</span>
                  <span className="font-medium text-[#1e2d1c]">
                    {training.passing_score != null ? `${training.passing_score}%` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b7260]">Intentos m&aacute;ximos</span>
                  <span className="font-medium text-[#1e2d1c]">
                    {training.max_attempts != null ? training.max_attempts : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Users */}
        <Card className="border-[#dde0d4] shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c] mb-3 lg:mb-4">Colaboradores asignados</h2>
            {assignments.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Sin asignaciones"
                description="Aún no hay colaboradores asignados a esta capacitación."
              />
            ) : (
              <div className="space-y-2">
                {assignments.map((a) => {
                  const profile = Array.isArray(a.profiles) ? a.profiles[0] ?? null : a.profiles;
                  const pName = profile?.full_name ?? profile?.email ?? "—";
                  return (
                    <div
                      key={a.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-[#dde0d4]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f2eb] text-sm font-medium text-[#1e2d1c] shrink-0">
                          {pName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1e2d1c]">{pName}</p>
                          {profile?.area && <p className="text-xs text-[#6b7260]">{profile.area}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-12 sm:ml-0">
                        <SedeBadge sedeId={profile?.sede_id ?? null} sedeName={sedeName(profile?.sede_id ?? null)} size="sm" />
                        <Badge
                          className={
                            a.status === "COMPLETED"
                              ? "bg-[#f0f2eb] text-[#2d4a2b] hover:bg-[#f0f2eb]"
                              : "bg-[#fff8e8] text-[#9a6800] hover:bg-[#fff8e8]"
                          }
                        >
                          {a.status === "COMPLETED" ? "Completado" : "Pendiente"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
