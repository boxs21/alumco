"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  FileText, Video, Presentation, Check, Award,
  ArrowRight, BookOpen, ClipboardList, ChevronLeft, Download, ExternalLink,
} from "lucide-react";

/* ─── Design tokens ──────────────────────────────────────────── */
const T = {
  navy:      "#15182b",
  blue:      "#2d4a8a",
  weakText:  "#6b7185",
  mutedText: "#a5a9b8",
  border:    "#e8e4dc",
  surface:   "#f6f3ee",
  blueLight: "#eaf0fb",
  shadow:    "0 1px 2px rgba(21,24,43,0.04), 0 6px 20px rgba(21,24,43,0.05)",
  shadowBtn: "rgba(45,74,138,0.28) 0px 1px 3px, rgba(0,0,0,0.08) 0px 0px 2px",
};

/* ─── Types ──────────────────────────────────────────────────── */
interface TrainingFile   { id: string; name: string; type: string; url: string | null }
interface QuestionOption { id: string; text: string; is_correct: boolean }
interface Question       { id: string; text: string; options: QuestionOption[] }
interface Quiz           { id: string; passing_score: number | null; max_attempts: number | null }
type Step = "material" | "quiz" | "certificate";

const FILE_ICONS: Record<string, typeof FileText> = {
  PDF: FileText, VIDEO: Video, PRESENTATION: Presentation,
};

/* ─── Embed URL helper ───────────────────────────────────────── */
function getEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const gd = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  return null;
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function CapacitacionPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  /* Step navigation */
  const [currentStep, setCurrentStep] = useState<Step>("material");

  /* Quiz */
  const [answers,   setAnswers]   = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score,     setScore]     = useState<number | null>(null);
  const [passed,    setPassed]    = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const quizStartRef              = useRef<string | null>(null);

  /* Certificate */
  const [certId,   setCertId]   = useState<string | null>(null);
  const [certCode, setCertCode] = useState<string | null>(null);

  /* Data */
  const [trainingTitle, setTrainingTitle] = useState("");
  const [files,     setFiles]     = useState<TrainingFile[]>([]);
  const [quiz,      setQuiz]      = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userId,    setUserId]    = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [alreadyDone,   setAlreadyDone]   = useState(false);
  const [attemptsUsed,  setAttemptsUsed]  = useState(0);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const [{ data: tData }, { data: fData }, { data: qData }] = await Promise.all([
        supabase.from("trainings").select("title").eq("id", id).single(),
        supabase.from("files").select("id, name, type, url").eq("training_id", id).order("order"),
        supabase.from("quizzes").select("id, passing_score, max_attempts").eq("training_id", id).maybeSingle(),
      ]);

      setTrainingTitle(tData?.title ?? "");
      setFiles(fData ?? []);
      setQuiz(qData ?? null);

      /* Check if already completed */
      if (user) {
        const { data: cert } = await supabase
          .from("certificates")
          .select("id, verification_code")
          .eq("user_id", user.id)
          .eq("training_id", id)
          .maybeSingle();

        if (cert) {
          setAlreadyDone(true);
          setSubmitted(true);
          setPassed(true);
          setCertId(cert.id);
          setCertCode(cert.verification_code ?? null);
          setCurrentStep("certificate");
        }
      }

      /* Load questions + options */
      if (qData?.id) {
        const { data: questionsData } = await supabase
          .from("questions")
          .select("id, text, order")
          .eq("quiz_id", qData.id)
          .order("order");

        if (questionsData && questionsData.length > 0) {
          const qIds = questionsData.map((q) => q.id);
          const { data: optData } = await supabase
            .from("options")
            .select("id, question_id, text, is_correct")
            .in("question_id", qIds);

          const opts = optData ?? [];
          setQuestions(
            questionsData.map((q) => ({
              id:      q.id,
              text:    q.text,
              options: opts.filter((o) => o.question_id === q.id),
            })),
          );
        }
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* ── Quiz submit + persist (B3) ───────────────────────────── */
  async function handleSubmitQuiz() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);

    /* Calculate score */
    let computed = 100;
    if (questions.length > 0) {
      let correct = 0;
      for (const q of questions) {
        const correctOpt = q.options.find((o) => o.is_correct);
        if (answers[q.id] && correctOpt && answers[q.id] === correctOpt.id) correct++;
      }
      computed = Math.round((correct / questions.length) * 100);
    }

    const didPass  = computed >= (quiz?.passing_score ?? 60);
    const supabase = createClient();
    const uid      = userId;

    if (uid && quiz) {
      /* Count prior attempts */
      const { count: prior } = await supabase
        .from("attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("quiz_id", quiz.id);

      /* INSERT attempt */
      const { data: attemptRow, error: attemptErr } = await supabase
        .from("attempts")
        .insert({
          user_id:        uid,
          quiz_id:        quiz.id,
          score:          computed,
          passed:         didPass,
          attempt_number: (prior ?? 0) + 1,
          started_at:     quizStartRef.current ?? new Date().toISOString(),
          finished_at:    new Date().toISOString(),
        })
        .select("id")
        .single();

      if (attemptErr) {
        setSaveError(attemptErr.message);
        setSaving(false);
        return;
      }

      /* Track total attempts used for max_attempts control */
      setAttemptsUsed((prior ?? 0) + 1);

      /* INSERT certificate + mark assignment COMPLETED if passed */
      if (didPass && attemptRow) {
        const verCode = crypto.randomUUID();
        const { data: certRow } = await supabase
          .from("certificates")
          .insert({
            user_id:           uid,
            training_id:       id,
            attempt_id:        attemptRow.id,
            verification_code: verCode,
            issued_at:         new Date().toISOString(),
          })
          .select("id, pdf_url, verification_code")
          .single();

        if (certRow) {
          // Trigger PDF generation
          try {
            await fetch(`/api/certificate/${certRow.id}`);
          } catch (e) {
            console.error("Error generating PDF:", e);
          }
          
          setCertId(certRow.id);
          setCertCode(certRow.verification_code ?? null);
        }

        /* Marcar assignment como completado */
        await supabase
          .from("assignments")
          .update({ status: "COMPLETED" })
          .eq("training_id", id)
          .eq("user_id", uid);
      }
    }

    setScore(computed);
    setPassed(didPass);
    setSubmitted(true);
    setSaving(false);
    setCurrentStep("certificate");
  }

  /* ── Complete without quiz ───────────────────────────────── */
  async function handleCompleteWithoutQuiz() {
    if (saving || !userId) return;
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const uid = userId;

    const verCode = crypto.randomUUID();

    const { data: certRow, error: certErr } = await supabase
      .from("certificates")
      .insert({
        user_id:           uid,
        training_id:       id,
        attempt_id:        null,
        verification_code: verCode,
        issued_at:         new Date().toISOString(),
      })
      .select("id, verification_code")
      .single();

    if (certErr || !certRow) {
      setSaveError(certErr?.message || "Error al crear el certificado");
      setSaving(false);
      return;
    }

    try {
      await fetch(`/api/certificate/${certRow.id}`);
    } catch (e) {
      console.error("Error generating PDF:", e);
    }
    
    setCertId(certRow.id);
    setCertCode(certRow.verification_code);

    await supabase
      .from("assignments")
      .update({ status: "COMPLETED" })
      .eq("training_id", id)
      .eq("user_id", uid);

    setCertCode(verCode);
    setPassed(true);
    setSubmitted(true);
    setAlreadyDone(true);
    setCurrentStep("certificate");
    setSaving(false);
  }

  /* ── Stepper helpers ─────────────────────────────────────── */
  const steps: { key: Step; label: string }[] = [
    { key: "material",    label: "Material"    },
    { key: "quiz",        label: "Evaluación"  },
    { key: "certificate", label: "Certificado" },
  ];
  const stepOrder: Step[] = ["material", "quiz", "certificate"];
  const currentIdx = stepOrder.indexOf(currentStep);
  const allAnswered = questions.length > 0 && Object.keys(answers).length >= questions.length;

  /* ── Loading / not-found ─────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-4 w-32 rounded bg-[#f0f0f0]" />
        <div className="h-7 w-64 rounded bg-[#f0f0f0]" />
        <div className="h-12 w-full rounded-2xl bg-[#f0f0f0]" />
      </div>
    );
  }

  if (!trainingTitle) {
    return (
      <p style={{ color: T.weakText }} className="text-sm py-8 text-center">
        Capacitación no encontrada.
      </p>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/portal"
          style={{ color: T.blue, letterSpacing: "0.08px" }}
          className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Mis capacitaciones
        </Link>
      </nav>

      {/* Title */}
      <h1
        style={{ color: T.navy, letterSpacing: "0.12px" }}
        className="text-xl lg:text-2xl font-semibold leading-snug"
      >
        {trainingTitle}
      </h1>

      {/* ── Stepper ─────────────────────────────────────────── */}
      <div
        style={{ border: `1px solid ${T.border}`, background: T.surface }}
        className="rounded-2xl px-3 lg:px-5 py-3 flex items-center"
        role="tablist"
        aria-label="Pasos de la capacitación"
      >
        {steps.map((step, i) => {
          const idx       = stepOrder.indexOf(step.key);
          const isDone    = idx < currentIdx || (step.key === "certificate" && submitted && passed);
          const isCurrent = step.key === currentStep;
          const isLocked  = step.key === "certificate" && !submitted;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <button
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-disabled={isLocked}
                disabled={isLocked}
                onClick={() => !isLocked && setCurrentStep(step.key)}
                className="flex items-center gap-2 min-w-0 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b61c9]/40 rounded-lg px-1 lg:px-2 py-1.5 transition-colors"
              >
                {/* Step circle */}
                <div
                  style={{
                    background: isDone ? "#15803d" : isCurrent ? T.blue : T.border,
                    flexShrink: 0,
                  }}
                  className="h-6 w-6 rounded-full flex items-center justify-center transition-all"
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  ) : (
                    <span className="text-[11px] font-semibold" style={{ color: isCurrent ? "white" : T.mutedText }}>
                      {i + 1}
                    </span>
                  )}
                </div>
                {/* Label */}
                <span
                  style={{
                    color: isDone ? "#15803d" : isCurrent ? T.navy : T.mutedText,
                    letterSpacing: "0.08px",
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                  className="text-xs sm:text-sm truncate"
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    background: stepOrder.indexOf(steps[i].key) < currentIdx ? "#15803d" : T.border,
                    height: "2px",
                    width: "20px",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Main + Sidebar grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

        {/* Main panel */}
        <div className="lg:col-span-2 space-y-4">

          {/* STEP 1 — Material */}
          {currentStep === "material" && (
            <div
              style={{ border: `1px solid ${T.border}`, boxShadow: T.shadow }}
              className="rounded-2xl bg-white overflow-hidden"
            >
              {/* Panel header */}
              <div
                style={{ borderBottom: `1px solid ${T.border}`, background: T.surface }}
                className="flex items-center gap-3 px-4 lg:px-5 py-3.5"
              >
                <div style={{ background: T.blueLight }} className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0">
                  <BookOpen style={{ color: T.blue }} className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 style={{ color: T.navy, letterSpacing: "0.1px" }} className="text-sm lg:text-base font-semibold">
                  Material de estudio
                </h2>
              </div>

              <div className="p-4 lg:p-5 space-y-3">
                {files.length === 0 ? (
                  <div className="py-10 text-center">
                    <BookOpen style={{ color: T.border }} className="h-8 w-8 mx-auto mb-2" aria-hidden="true" />
                    <p style={{ color: T.weakText, letterSpacing: "0.08px" }} className="text-sm">
                      Sin archivos de estudio.
                    </p>
                  </div>
                ) : (
                  files.map((file) => {
                    if (file.type === "VIDEO" && file.url) {
                      const embedUrl = getEmbedUrl(file.url);
                      return (
                        <div
                          key={file.id}
                          style={{ border: `1px solid ${T.border}` }}
                          className="rounded-xl overflow-hidden"
                        >
                          <div
                            style={{ borderBottom: `1px solid ${T.border}`, background: T.surface }}
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <div style={{ background: T.blueLight }} className="flex h-7 w-7 items-center justify-center rounded-md shrink-0">
                              <Video style={{ color: T.blue }} className="h-3.5 w-3.5" aria-hidden="true" />
                            </div>
                            <p style={{ color: T.navy, letterSpacing: "0.08px" }} className="text-sm font-medium truncate flex-1">
                              {file.name || "Video"}
                            </p>
                            <span
                              style={{ background: T.blueLight, color: T.blue, letterSpacing: "0.07px" }}
                              className="hidden sm:inline text-[10px] font-semibold uppercase px-2 py-0.5 rounded"
                            >
                              VIDEO
                            </span>
                          </div>
                          {embedUrl ? (
                            <iframe
                              src={embedUrl}
                              title={file.name || "Video"}
                              className="w-full aspect-video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="p-4 text-sm" style={{ color: T.weakText }}>
                              Video no disponible.
                            </div>
                          )}
                        </div>
                      );
                    }

                    const FileIcon = FILE_ICONS[file.type] ?? FileText;
                    return (
                      <div
                        key={file.id}
                        style={{ border: `1px solid ${T.border}` }}
                        className="flex items-center gap-3 p-3 lg:p-3.5 rounded-xl hover:bg-[#f8fafc] transition-colors"
                      >
                        <div style={{ background: T.blueLight }} className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0">
                          <FileIcon style={{ color: T.blue }} className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <p style={{ color: T.navy, letterSpacing: "0.08px" }} className="text-sm font-medium truncate flex-1">
                          {file.name}
                        </p>
                        <span
                          style={{ background: T.surface, color: T.mutedText, border: `1px solid ${T.border}`, letterSpacing: "0.07px" }}
                          className="hidden sm:inline text-[10px] font-semibold uppercase px-2 py-0.5 rounded"
                        >
                          {file.type}
                        </span>
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: T.blue }}
                            className="flex items-center gap-1 text-xs font-medium hover:underline shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver
                          </a>
                        )}
                      </div>
                    );
                  })
                )}

                <button
                  onClick={() => {
                    quizStartRef.current = new Date().toISOString();
                    setCurrentStep("quiz");
                  }}
                  style={{ background: T.blue, boxShadow: T.shadowBtn, letterSpacing: "0.08px" }}
                  className="mt-2 inline-flex items-center gap-2 h-10 lg:h-11 px-5 rounded-xl text-white text-sm font-medium hover:brightness-110 transition-all"
                >
                  Continuar a la evaluación
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Quiz */}
          {currentStep === "quiz" && !submitted && (
            <div
              style={{ border: `1px solid ${T.border}`, boxShadow: T.shadow }}
              className="rounded-2xl bg-white overflow-hidden"
            >
              <div
                style={{ borderBottom: `1px solid ${T.border}`, background: T.surface }}
                className="flex items-center gap-3 px-4 lg:px-5 py-3.5"
              >
                <div style={{ background: T.blueLight }} className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0">
                  <ClipboardList style={{ color: T.blue }} className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 style={{ color: T.navy, letterSpacing: "0.1px" }} className="text-sm lg:text-base font-semibold">
                    Evaluación
                  </h2>
                  {questions.length > 0 && (
                    <p style={{ color: T.mutedText, letterSpacing: "0.07px" }} className="text-xs mt-0.5">
                      {Object.keys(answers).length} de {questions.length} respondidas
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 lg:p-5 space-y-5 lg:space-y-6">
                {questions.length === 0 ? (
                  <div className="py-10 text-center">
                    <ClipboardList style={{ color: T.border }} className="h-8 w-8 mx-auto mb-2" aria-hidden="true" />
                    <p style={{ color: T.weakText, letterSpacing: "0.08px" }} className="text-sm">
                      Esta capacitación no tiene evaluación.
                    </p>
                  </div>
                ) : (
                  questions.map((q, qi) => (
                    <div key={q.id} className="space-y-2.5">
                      <p style={{ color: T.navy, letterSpacing: "0.08px" }} className="text-sm font-semibold">
                        {qi + 1}.&nbsp;{q.text}
                      </p>
                      <div className="space-y-2" role="radiogroup" aria-label={`Pregunta ${qi + 1}`}>
                        {q.options.map((opt) => {
                          const sel = answers[q.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              role="radio"
                              aria-checked={sel}
                              onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                              style={{
                                border: sel ? `2px solid ${T.blue}` : `1px solid ${T.border}`,
                                background: sel ? T.blueLight : "white",
                                letterSpacing: "0.08px",
                              }}
                              className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-sm transition-all hover:border-[#1b61c9]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b61c9]/40"
                            >
                              <div
                                style={{
                                  background: sel ? T.blue : "white",
                                  border: `2px solid ${sel ? T.blue : T.border}`,
                                  flexShrink: 0,
                                }}
                                className="h-5 w-5 rounded-full flex items-center justify-center transition-all"
                              >
                                {sel && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
                              </div>
                              <span style={{ color: sel ? T.navy : "rgba(4,14,32,0.69)" }}>
                                {opt.text}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}

                {saveError && (
                  <p className="text-sm text-red-600" role="alert">{saveError}</p>
                )}

                <button
                  onClick={questions.length === 0 ? handleCompleteWithoutQuiz : handleSubmitQuiz}
                  disabled={(questions.length > 0 && !allAnswered) || saving}
                  style={{ background: T.blue, boxShadow: T.shadowBtn, letterSpacing: "0.08px" }}
                  className="inline-flex items-center gap-2 h-10 lg:h-11 px-6 rounded-xl text-white text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Guardando…"
                    : questions.length === 0
                    ? "Completar capacitación"
                    : "Enviar respuestas"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Certificate */}
          {currentStep === "certificate" && (
            <div
              style={{ border: `1px solid ${T.border}`, boxShadow: T.shadow }}
              className="rounded-2xl bg-white overflow-hidden"
            >
              <div className="p-6 lg:p-10 text-center space-y-4">
                {/* Icon */}
                <div
                  style={{ background: passed ? "#f0fdf4" : "#fff8ed" }}
                  className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto"
                >
                  <Award
                    style={{ color: passed ? "#15803d" : "#d97706" }}
                    className="h-8 w-8"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2
                    style={{ color: T.navy, letterSpacing: "0.12px" }}
                    className="text-lg lg:text-xl font-semibold"
                  >
                    {passed ? "¡Capacitación completada!" : "Evaluación finalizada"}
                  </h2>
                  {score != null && (
                    <p style={{ color: T.weakText, letterSpacing: "0.08px" }} className="text-sm mt-1">
                      Obtuviste&nbsp;
                      <span style={{ color: T.navy }} className="font-semibold">{score}%</span>
                      {quiz?.passing_score != null && (
                        <> &mdash; mínimo requerido:&nbsp;
                          <span className="font-semibold">{quiz.passing_score}%</span>
                        </>
                      )}
                    </p>
                  )}
                </div>

                {passed ? (
                  <div className="space-y-3">
                    {certCode && (
                      <p style={{ color: T.mutedText, letterSpacing: "0.07px" }} className="text-xs">
                        Código de verificación:&nbsp;
                        <span className="font-mono font-semibold" style={{ color: T.navy }}>
                          {certCode.slice(0, 8).toUpperCase()}
                        </span>
                      </p>
                    )}

                    {certId ? (
                      <a
                        href={`/api/certificate/${certId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ background: T.blue, boxShadow: T.shadowBtn, letterSpacing: "0.08px" }}
                        className="inline-flex items-center gap-2 h-10 lg:h-11 px-6 rounded-xl text-white text-sm font-medium hover:brightness-110 transition-all"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Descargar certificado
                      </a>
                    ) : (
                      <div
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          color: "#15803d",
                          letterSpacing: "0.07px",
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Certificado registrado — disponible en Historial
                      </div>
                    )}

                    <div>
                      <Link
                        href="/portal/historial"
                        style={{ color: T.blue, letterSpacing: "0.08px" }}
                        className="text-sm font-medium hover:underline"
                      >
                        Ver en Historial →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p style={{ color: T.weakText, letterSpacing: "0.08px" }} className="text-sm">
                      No alcanzaste la nota mínima.
                    </p>
                    {quiz?.max_attempts != null && attemptsUsed >= quiz.max_attempts ? (
                      <div
                        style={{
                          background: "#fff8ed",
                          border: "1px solid #fde68a",
                          color: "#d97706",
                          letterSpacing: "0.07px",
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                        role="alert"
                      >
                        Alcanzaste el número máximo de intentos ({quiz.max_attempts})
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAnswers({});
                          setSubmitted(false);
                          setScore(null);
                          setSaveError(null);
                          quizStartRef.current = new Date().toISOString();
                          setCurrentStep("quiz");
                        }}
                        style={{ background: T.blue, boxShadow: T.shadowBtn, letterSpacing: "0.08px" }}
                        className="inline-flex items-center gap-2 h-10 lg:h-11 px-6 rounded-xl text-white text-sm font-medium hover:brightness-110 transition-all"
                      >
                        Reintentar evaluación
                        {quiz?.max_attempts != null && (
                          <span className="opacity-70 text-xs font-normal">
                            ({attemptsUsed}/{quiz.max_attempts})
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Progress card */}
          <div
            style={{ border: `1px solid ${T.border}`, boxShadow: T.shadow }}
            className="rounded-2xl bg-white p-4 lg:p-5 space-y-3"
          >
            <h3 style={{ color: T.navy, letterSpacing: "0.1px" }} className="text-sm font-semibold">
              Tu progreso
            </h3>
            <div className="space-y-2.5">
              {steps.map((step) => {
                const idx    = stepOrder.indexOf(step.key);
                const isDone = idx < currentIdx || (step.key === "certificate" && submitted && passed);
                const isCurr = step.key === currentStep;
                return (
                  <div key={step.key} className="flex items-center gap-2.5">
                    <div
                      style={{
                        background: isDone ? "#f0fdf4" : isCurr ? T.blueLight : T.surface,
                        border: isDone
                          ? "1.5px solid #bbf7d0"
                          : isCurr
                          ? `1.5px solid ${T.blue}`
                          : `1.5px solid ${T.border}`,
                        flexShrink: 0,
                      }}
                      className="h-5 w-5 rounded-full flex items-center justify-center"
                    >
                      {isDone ? (
                        <Check style={{ color: "#15803d" }} className="h-3 w-3" aria-hidden="true" />
                      ) : isCurr ? (
                        <div style={{ background: T.blue }} className="h-2 w-2 rounded-full" aria-hidden="true" />
                      ) : null}
                    </div>
                    <span
                      style={{
                        color: isDone ? "#15803d" : isCurr ? T.navy : T.mutedText,
                        letterSpacing: "0.07px",
                        fontWeight: isCurr ? 500 : 400,
                      }}
                      className="text-sm"
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info card */}
          <div
            style={{ border: `1px solid ${T.border}`, boxShadow: T.shadow }}
            className="rounded-2xl bg-white p-4 lg:p-5 space-y-2.5"
          >
            <h3 style={{ color: T.navy, letterSpacing: "0.1px" }} className="text-sm font-semibold">
              Información
            </h3>
            <div className="space-y-2 text-sm">
              <InfoRow label="Preguntas"      value={String(questions.length)} />
              <InfoRow label="Nota mínima"    value={quiz?.passing_score != null ? `${quiz.passing_score}%` : "—"} />
              <InfoRow label="Intentos máx."  value={quiz?.max_attempts != null ? String(quiz.max_attempts) : "—"} />
            </div>
            {alreadyDone && (
              <div
                style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", letterSpacing: "0.07px" }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium mt-1"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Ya completada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper ──────────────────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span style={{ color: "rgba(4,14,32,0.55)", letterSpacing: "0.07px" }}>{label}</span>
      <span style={{ color: "#181d26", letterSpacing: "0.07px" }} className="font-medium">
        {value}
      </span>
    </div>
  );
}