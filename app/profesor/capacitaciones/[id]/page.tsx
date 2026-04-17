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
  Globe,
  EyeOff,
} from "lucide-react";

interface Training {
  id: string;
  title: string;
  target_area: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sede_id: string | null;
}

interface Quiz {
  id: string;
  passing_score: number | null;
  max_attempts: number | null;
}

interface TrainingFile {
  id: string;
  name: string;
  type: string;
  url: string | null;
}

interface AssignmentProfile {
  name: string | null;
  email: string | null;
  area: string | null;
  sede_id: string | null;
}

interface Assignment {
  id: string;
  user_id: string;
  status: string;
  profiles: AssignmentProfile[] | AssignmentProfile | null;
}

const fileTypeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  VIDEO: Video,
  PRESENTATION: Presentation,
};

const statusConfig = {
  DRAFT:     { label: "Borrador",  className: "bg-[#EEF2FF] text-[#6B7AB0]" },
  PUBLISHED: { label: "Publicado", className: "bg-[#EEF2FF] text-[#2B4BA8]" },
  ARCHIVED:  { label: "Archivado", className: "bg-[#FEF0F2] text-[#E8445A]" },
};

export default function ProfesorCapacitacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [training, setTraining] = useState<Training | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [files, setFiles] = useState<TrainingFile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [
        { data: trainingData },
        { data: filesData },
        { data: quizData },
        { data: assignmentsData },
      ] = await Promise.all([
        supabase
          .from("trainings")
          .select("id, title, target_area, status, sede_id")
          .eq("id", id)
          .single(),
        supabase.from("files").select("id, name, type, url").eq("training_id", id),
        supabase.from("quizzes").select("id, passing_score, max_attempts").eq("training_id", id).maybeSingle(),
        supabase
          .from("assignments")
          .select("id, user_id, status, profiles(name, email, area, sede_id)")
          .eq("training_id", id),
      ]);
      setTraining(trainingData as Training | null);
      setFiles(filesData ?? []);
      setQuiz(quizData ?? null);
      setAssignments(((assignmentsData ?? []) as unknown) as Assignment[]);

      if (quizData?.id) {
        const { count } = await supabase
          .from("questions")
          .select("id", { count: "exact", head: true })
          .eq("quiz_id", quizData.id);
        setQuestionCount(count ?? 0);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Topbar title="" />
        <div className="p-6 text-sm text-[#6B7AB0]">Cargando...</div>
      </div>
    );
  }

  if (!training) {
    return (
      <div>
        <Topbar title="" />
        <div className="p-6 text-sm text-[#6B7AB0]">Capacitación no encontrada.</div>
      </div>
    );
  }

  const statusInfo = statusConfig[training.status] ?? statusConfig.DRAFT;
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  async function handleToggleStatus() {
    if (!training || publishing) return;
    setPublishing(true);
    const next = training.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const { error } = await createClient()
      .from("trainings")
      .update({ status: next })
      .eq("id", id);
    if (!error) setTraining((prev) => prev ? { ...prev, status: next as Training["status"] } : prev);
    setPublishing(false);
  }

  return (
    <div>
      <Topbar title="" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#4A5C8A]">
          <Link href="/profesor/capacitaciones" className="hover:text-[#1A2F6B] transition-colors">
            Capacitaciones
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#1A2F6B] font-medium truncate max-w-[200px] sm:max-w-none">{training.title}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <h1 className="text-xl lg:text-2xl font-semibold text-[#1A2F6B]">{training.title}</h1>
              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <SedeBadge sedeId={training.sede_id} sedeName={sedeName(training.sede_id)} />
              {training.target_area && <span className="text-sm text-[#4A5C8A]">&Aacute;rea: {training.target_area}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={publishing}
              className={`inline-flex items-center justify-center gap-2 h-10 lg:h-11 px-4 lg:px-5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                training.status === "PUBLISHED"
                  ? "border border-[#C8D4EC] bg-[#FAFBFF] text-[#6B7AB0] hover:bg-[#EEF2FF]"
                  : "border border-[#2B4BA8] bg-[#EEF2FF] text-[#2B4BA8] hover:bg-[#DDE5F5]"
              }`}
            >
              {training.status === "PUBLISHED"
                ? <><EyeOff className="h-4 w-4" /><span className="hidden sm:inline">Despublicar</span></>
                : <><Globe className="h-4 w-4" /><span className="hidden sm:inline">Publicar</span></>
              }
            </button>
            <Link
              href={`/profesor/capacitaciones/${id}/asignar`}
              className="inline-flex items-center justify-center gap-2 h-10 lg:h-11 px-4 lg:px-5 rounded-lg bg-[#2B4BA8] text-white text-sm font-medium hover:bg-[#1A2F6B] transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Asignar colaboradores</span>
              <span className="sm:hidden">Asignar</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
          <StatCard title="Asignados" value={total} icon={Users} />
          <StatCard title="Completados" value={completed} icon={CheckCircle} />
          <StatCard title="Cumplimiento" value={`${progress}%`} icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card className="border-[#C8D4EC] shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#1A2F6B] mb-3 lg:mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#8A9BC8]" aria-hidden="true" />
                Material formativo
              </h2>
              {files.length === 0 ? (
                <p className="text-sm text-[#6B7AB0]">Sin archivos cargados.</p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => {
                    const FileIcon = fileTypeIcons[file.type] ?? FileText;
                    return (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#C8D4EC]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF]">
                          <FileIcon className="h-4 w-4 text-[#4A5C8A]" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A2F6B] truncate">{file.name}</p>
                          {file.type === "VIDEO" && file.url && (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#2B4BA8] hover:underline truncate block"
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

          <Card className="border-[#C8D4EC] shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <h2 className="text-sm lg:text-base font-semibold text-[#1A2F6B] mb-3 lg:mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#8A9BC8]" aria-hidden="true" />
                Evaluaci&oacute;n
              </h2>
              {quiz ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A5C8A]">Preguntas</span>
                    <span className="font-medium text-[#1A2F6B]">{questionCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A5C8A]">Nota m&iacute;nima</span>
                    <span className="font-medium text-[#1A2F6B]">
                      {quiz.passing_score != null ? `${quiz.passing_score}%` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A5C8A]">Intentos m&aacute;ximos</span>
                    <span className="font-medium text-[#1A2F6B]">
                      {quiz.max_attempts != null ? quiz.max_attempts : "—"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#6B7AB0]">Sin evaluación configurada.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#C8D4EC] shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <h2 className="text-sm lg:text-base font-semibold text-[#1A2F6B] mb-3 lg:mb-4">Colaboradores asignados</h2>
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
                  const pName = profile?.name ?? profile?.email ?? "—";
                  return (
                    <div
                      key={a.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-[#C8D4EC]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF] text-sm font-medium text-[#1A2F6B] shrink-0">
                          {pName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A2F6B]">{pName}</p>
                          {profile?.area && <p className="text-xs text-[#4A5C8A]">{profile.area}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-12 sm:ml-0">
                        <SedeBadge sedeId={profile?.sede_id ?? null} sedeName={sedeName(profile?.sede_id ?? null)} size="sm" />
                        <Badge
                          className={
                            a.status === "COMPLETED"
                              ? "bg-[#EEF2FF] text-[#2B4BA8] hover:bg-[#EEF2FF]"
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
