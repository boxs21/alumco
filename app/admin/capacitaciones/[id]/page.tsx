"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
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
  ExternalLink,
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
  DRAFT:     { label: "Borrador",  className: "bg-[#f0ece4] text-[#6b7185] border-[#e8e4dc]" },
  PUBLISHED: { label: "Publicado", className: "bg-[#eaf0fb] text-[#2d4a8a] border-[#c3d5f4]" },
  ARCHIVED:  { label: "Archivado", className: "bg-[#ffe6e1] text-[#e86154] border-[#ffccc5]" },
};

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

export default function CapacitacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
        supabase.from("trainings").select("id, title, target_area, status, sede_id").eq("id", id).single(),
        supabase.from("files").select("id, name, type, url").eq("training_id", id),
        supabase.from("quizzes").select("id, passing_score, max_attempts").eq("training_id", id).maybeSingle(),
        supabase.from("assignments").select("id, user_id, status, profiles(name, email, area, sede_id)").eq("training_id", id),
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
        <Topbar title="Capacitación" sub="Cargando…" />
        <div className="p-6 text-[13px] text-[#6b7185]">Cargando...</div>
      </div>
    );
  }

  if (!training) {
    return (
      <div>
        <Topbar title="Capacitación" sub="No se pudo cargar." />
        <div className="p-6 text-[13px] text-[#6b7185]">Capacitación no encontrada.</div>
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
    const { error } = await createClient().from("trainings").update({ status: next }).eq("id", id);
    if (!error) setTraining((prev) => prev ? { ...prev, status: next as Training["status"] } : prev);
    setPublishing(false);
  }

  const statusLabel = training.status === "PUBLISHED" ? "Publicado" : training.status === "DRAFT" ? "Borrador" : "Archivado";

  return (
    <div>
      <Topbar
        title={training.title}
        sub={`${training.target_area} · ${statusLabel}`}
        right={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white border border-[#e8e4dc] text-[#15182b] text-[13px] font-[600] hover:bg-[#f7f5f0] transition-colors">
              Guardar borrador
            </button>
            <button
              onClick={handleToggleStatus}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors disabled:opacity-60"
            >
              {training.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
            </button>
          </div>
        }
      />

      <div className="p-4 lg:p-6 space-y-5 lg:space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12.5px] text-[#a5a9b8]">
          <Link href="/admin/capacitaciones" className="hover:text-[#15182b] transition-colors">
            Capacitaciones
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#6b7185] truncate max-w-[220px] sm:max-w-none">{training.title}</span>
        </nav>

        {/* Header card */}
        <div
          className="rounded-[20px] relative overflow-hidden text-white p-6 lg:p-8"
          style={{ background: "linear-gradient(115deg, #2d4a8a 0%, #1f3769 58%, #16284d 100%)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-60px] top-[-60px] w-[220px] h-[220px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,124,107,0.30), transparent 70%)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[100px] bottom-[-50px] w-[120px] h-[120px] rounded-full"
            style={{ background: "rgba(242,181,68,0.40)" }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-[700] border ${statusInfo.className}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  {statusInfo.label}
                </span>
                <SedeBadge sedeId={training.sede_id} sedeName={sedeName(training.sede_id)} size="sm" />
              </div>
              <h1 className="text-[22px] lg:text-[26px] font-[800] tracking-[-0.025em] leading-[1.15] text-white">
                {training.title}
              </h1>
              {training.target_area && (
                <p className="text-[13px] text-white/60">{training.target_area}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={publishing}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] text-[13px] font-[600] transition-all disabled:opacity-50 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                {training.status === "PUBLISHED"
                  ? <><EyeOff className="h-4 w-4" /><span className="hidden sm:inline">Despublicar</span></>
                  : <><Globe className="h-4 w-4" /><span className="hidden sm:inline">Publicar</span></>
                }
              </button>
              <Link
                href={`/admin/capacitaciones/${id}/asignar`}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Asignar colaboradores</span>
                <span className="sm:hidden">Asignar</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
          <StatCard title="Asignados"   value={total}       icon={Users}       variant="navy" />
          <StatCard title="Completados" value={completed}   icon={CheckCircle} variant="default" />
          <StatCard title="Cumplimiento" value={`${progress}%`} icon={TrendingUp} variant="coral" />
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="rounded-[16px] border border-[#e8e4dc] bg-white p-4 lg:p-5 space-y-2">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="font-[600] text-[#15182b]">Progreso de cumplimiento</span>
              <span className="font-[700] text-[#2d4a8a]">{progress}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#f0ece4] overflow-hidden">
              <div className="h-2.5 rounded-full bg-[#2d4a8a] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[11.5px] text-[#a5a9b8]">{completed} de {total} colaboradores completaron esta capacitación</p>
          </div>
        )}

        {/* Material + Quiz */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <Card className="border-[#e8e4dc] shadow-sm">
            <CardContent className="p-4 lg:p-5">
              <h2 className="text-[13px] font-[700] text-[#15182b] mb-3 flex items-center gap-2 uppercase tracking-[0.05em]">
                <div className="h-6 w-6 rounded-[8px] bg-[#eaf0fb] flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-[#2d4a8a]" aria-hidden="true" />
                </div>
                Material formativo
              </h2>
              {files.length === 0 ? (
                <p className="text-[13px] text-[#a5a9b8] italic">Sin archivos cargados.</p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => {
                    const FileIcon = fileTypeIcons[file.type] ?? FileText;
                    return (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-[12px] border border-[#e8e4dc] bg-[#f7f5f0]">
                        <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#eaf0fb] shrink-0">
                          <FileIcon className="h-4 w-4 text-[#2d4a8a]" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-[600] text-[#15182b] truncate">{file.name}</p>
                          {file.type === "VIDEO" && file.url && (
                            <a href={file.url} target="_blank" rel="noopener noreferrer"
                              className="text-[11.5px] text-[#2d4a8a] hover:underline truncate block">
                              {file.url}
                            </a>
                          )}
                        </div>
                        {file.type !== "VIDEO" && file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[12px] font-[600] text-[#2d4a8a] hover:underline shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#e8e4dc] shadow-sm">
            <CardContent className="p-4 lg:p-5">
              <h2 className="text-[13px] font-[700] text-[#15182b] mb-3 flex items-center gap-2 uppercase tracking-[0.05em]">
                <div className="h-6 w-6 rounded-[8px] bg-[#ffe6e1] flex items-center justify-center">
                  <ClipboardList className="h-3.5 w-3.5 text-[#e86154]" aria-hidden="true" />
                </div>
                Evaluación
              </h2>
              {quiz ? (
                <div className="space-y-2.5">
                  {[
                    { label: "Preguntas",       value: questionCount },
                    { label: "Nota mínima",     value: quiz.passing_score != null ? `${quiz.passing_score}%` : "—" },
                    { label: "Intentos máximos", value: quiz.max_attempts != null ? quiz.max_attempts : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-[#f0ece4] last:border-0">
                      <span className="text-[13px] text-[#6b7185]">{label}</span>
                      <span className="text-[13px] font-[700] text-[#15182b]">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#a5a9b8] italic">Sin evaluación configurada.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assigned Users */}
        <Card className="border-[#e8e4dc] shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <h2 className="text-[13px] font-[700] text-[#15182b] mb-3 uppercase tracking-[0.05em]">
              Colaboradores asignados
            </h2>
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
                  const palette = avatarPalette(pName);
                  const initials = pName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                  const isDone = a.status === "COMPLETED";
                  return (
                    <div
                      key={a.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-[12px] border border-[#e8e4dc] bg-[#f7f5f0]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-[11px] text-[12px] font-[700] shrink-0 ${palette.bg} ${palette.text}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-[13px] font-[600] text-[#15182b]">{pName}</p>
                          {profile?.area && <p className="text-[11.5px] text-[#6b7185]">{profile.area}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-12 sm:ml-0">
                        <SedeBadge sedeId={profile?.sede_id ?? null} sedeName={sedeName(profile?.sede_id ?? null)} size="sm" />
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-[700] ${
                          isDone
                            ? "bg-[#dbeee3] text-[#1a6a43]"
                            : "bg-[#fff8e8] text-[#9a6800]"
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {isDone ? "Completado" : "Pendiente"}
                        </span>
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
