"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";
import {
  FileText,
  Video,
  Presentation,
  Check,
  CheckCircle,
  Award,
  ArrowRight,
  BookOpen,
  ClipboardList,
} from "lucide-react";

interface TrainingFile {
  id: string;
  name: string;
  type: string;
  url: string | null;
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const gdMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
  return null;
}

interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

interface TrainingQuestion {
  id: string;
  text: string;
  options: QuestionOption[];
}

interface Quiz {
  id: string;
  passing_score: number | null;
  max_attempts: number | null;
}

interface TrainingInfo {
  title: string;
}

const fileTypeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  VIDEO: Video,
  PRESENTATION: Presentation,
};

type Step = "material" | "quiz" | "certificate";

export default function CapacitacionPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [currentStep, setCurrentStep] = useState<Step>("material");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const [training, setTraining] = useState<TrainingInfo | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [files, setFiles] = useState<TrainingFile[]>([]);
  const [questions, setQuestions] = useState<TrainingQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data: trainingData }, { data: filesData }, { data: quizData }] = await Promise.all([
        supabase.from("trainings").select("title").eq("id", id).single(),
        supabase.from("files").select("id, name, type, url").eq("training_id", id).order("order"),
        supabase.from("quizzes").select("id, passing_score, max_attempts").eq("training_id", id).maybeSingle(),
      ]);

      setTraining(trainingData ?? null);
      setFiles(filesData ?? []);
      setQuiz(quizData ?? null);

      // Load questions + options for the quiz
      if (quizData?.id) {
        const { data: questionsData } = await supabase
          .from("questions")
          .select("id, text, order")
          .eq("quiz_id", quizData.id)
          .order("order");

        if (questionsData && questionsData.length > 0) {
          const qIds = questionsData.map((q) => q.id);
          const { data: optionsData } = await supabase
            .from("options")
            .select("id, question_id, text, is_correct")
            .in("question_id", qIds);

          const opts = optionsData ?? [];
          setQuestions(
            questionsData.map((q) => ({
              id: q.id,
              text: q.text,
              options: opts.filter((o) => o.question_id === q.id),
            }))
          );
        }
      }

      setLoading(false);
    }
    load();
  }, [id]);

  function handleSubmitQuiz() {
    if (questions.length === 0) {
      setScore(100);
      setSubmitted(true);
      setCurrentStep("certificate");
      return;
    }
    let correct = 0;
    for (const q of questions) {
      const selectedId = answers[q.id];
      const correctOpt = q.options.find((o) => o.is_correct);
      if (selectedId && correctOpt && selectedId === correctOpt.id) correct++;
    }
    const computed = Math.round((correct / questions.length) * 100);
    setScore(computed);
    setSubmitted(true);
    setCurrentStep("certificate");
  }

  const steps: { key: Step; label: string; shortLabel: string }[] = [
    { key: "material",    label: "Revisar material",    shortLabel: "Material" },
    { key: "quiz",        label: "Rendir evaluación",   shortLabel: "Evaluación" },
    { key: "certificate", label: "Obtener certificado", shortLabel: "Certificado" },
  ];

  if (loading) {
    return (
      <div className="text-sm text-[#7d8471] py-8 text-center">Cargando...</div>
    );
  }

  if (!training) {
    return (
      <div className="text-sm text-[#7d8471]">Capacitación no encontrada.</div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-[#1e2d1c]">{training.title}</h1>
      </div>

      {/* Step indicator */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                if (step.key === "certificate" && !submitted) return;
                setCurrentStep(step.key);
              }}
              aria-label={`Ir a paso ${i + 1}: ${step.label}`}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === step.key ? "bg-[#f0f2eb] text-[#1e2d1c]" : "text-[#6b7260] hover:text-[#1e2d1c]"
              }`}
            >
              <div
                className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0 ${
                  (step.key === "material" && (currentStep === "quiz" || currentStep === "certificate")) ||
                  (step.key === "quiz" && currentStep === "certificate")
                    ? "bg-[#2d4a2b] text-white"
                    : currentStep === step.key
                    ? "bg-[#2d4a2b] text-white"
                    : "bg-[#dde0d4] text-[#6b7260]"
                }`}
              >
                {(step.key === "material" && (currentStep === "quiz" || currentStep === "certificate")) ||
                (step.key === "quiz" && currentStep === "certificate") ? (
                  <Check className="h-3 w-3" />
                ) : (
                  i + 1
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.shortLabel}</span>
            </button>
            {i < steps.length - 1 && <div className="w-4 sm:w-8 h-px bg-[#dde0d4]" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          {currentStep === "material" && (
            <Card className="border-[#dde0d4] shadow-sm">
              <CardContent className="p-4 lg:p-6 space-y-4">
                <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c]">Material de estudio</h2>
                {files.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <BookOpen className="h-8 w-8 text-[#dde0d4] mb-2" aria-hidden="true" />
                    <p className="text-sm text-[#7d8471]">Sin archivos de estudio.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => {
                      if (file.type === "VIDEO" && file.url) {
                        const embedUrl = getEmbedUrl(file.url);
                        return (
                          <div key={file.id} className="rounded-lg border border-[#dde0d4] overflow-hidden">
                            <div className="flex items-center gap-3 px-3 lg:px-4 py-2.5 bg-[#faf9f6] border-b border-[#dde0d4]">
                              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#f0f2eb]">
                                <Video className="h-3.5 w-3.5 text-[#6b7260]" aria-hidden="true" />
                              </div>
                              <p className="text-sm font-medium text-[#1e2d1c] truncate flex-1">{file.name || "Video"}</p>
                              <Badge className="bg-[#f0f2eb] text-[#6b7260] hover:bg-[#f0f2eb] hidden sm:inline-flex shrink-0">
                                VIDEO
                              </Badge>
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
                              <div className="p-4 text-sm text-[#7d8471]">Video no disponible.</div>
                            )}
                          </div>
                        );
                      }
                      const FileIcon = fileTypeIcons[file.type] ?? FileText;
                      return (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 lg:p-4 rounded-lg border border-[#dde0d4] hover:bg-[#faf9f6] cursor-pointer transition-colors"
                        >
                          <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-lg bg-[#f0f2eb]">
                            <FileIcon className="h-4 w-4 lg:h-5 lg:w-5 text-[#6b7260]" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1e2d1c] truncate">{file.name}</p>
                          </div>
                          <Badge className="bg-[#f0f2eb] text-[#6b7260] hover:bg-[#f0f2eb] hidden sm:inline-flex">
                            {file.type}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={() => setCurrentStep("quiz")}
                  className="inline-flex items-center gap-2 h-10 lg:h-11 px-5 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors mt-2"
                >
                  Continuar a la evaluaci&oacute;n
                  <ArrowRight className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          )}

          {currentStep === "quiz" && !submitted && (
            <Card className="border-[#dde0d4] shadow-sm">
              <CardContent className="p-4 lg:p-6 space-y-5 lg:space-y-6">
                <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c]">Evaluaci&oacute;n</h2>
                {questions.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <ClipboardList className="h-8 w-8 text-[#dde0d4] mb-2" aria-hidden="true" />
                    <p className="text-sm text-[#7d8471]">Esta capacitación no tiene evaluación.</p>
                  </div>
                ) : (
                  questions.map((q, qi) => (
                    <div key={q.id} className="space-y-3">
                      <p className="text-sm font-semibold text-[#1e2d1c]">
                        {qi + 1}. {q.text}
                      </p>
                      <div className="space-y-2" role="radiogroup" aria-label={`Pregunta ${qi + 1}`}>
                        {q.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            role="radio"
                            aria-checked={answers[q.id] === opt.id}
                            onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left text-sm transition-colors ${
                              answers[q.id] === opt.id
                                ? "border-[#a4ac86] bg-[#f0f2eb] text-[#1e2d1c]"
                                : "border-[#dde0d4] text-[#1e2d1c] hover:bg-[#faf9f6]"
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                answers[q.id] === opt.id ? "border-[#2d4a2b] bg-[#2d4a2b]" : "border-[#dde0d4]"
                              }`}
                            >
                              {answers[q.id] === opt.id && <Check className="h-3 w-3 text-white" />}
                            </div>
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={handleSubmitQuiz}
                  disabled={questions.length > 0 && Object.keys(answers).length < questions.length}
                  className="inline-flex items-center gap-2 h-10 lg:h-11 px-6 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {questions.length === 0 ? "Completar capacitación" : "Enviar respuestas"}
                </button>
              </CardContent>
            </Card>
          )}

          {currentStep === "certificate" && (
            <Card className="border-[#dde0d4] shadow-sm">
              <CardContent className="p-6 lg:p-8 text-center space-y-4">
                <div className="flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-[#f0f2eb] mx-auto">
                  <Award className="h-7 w-7 lg:h-8 lg:w-8 text-[#2d4a2b]" />
                </div>
                <h2 className="text-lg lg:text-xl font-semibold text-[#1e2d1c]">Capacitaci&oacute;n completada</h2>
                {score != null && (
                  <p className="text-sm text-[#6b7260]">
                    Has obtenido una nota de{" "}
                    <span className="font-semibold text-[#1e2d1c]">{score}%</span>.
                    Tu certificado est&aacute; listo para descargar.
                  </p>
                )}
                <button className="inline-flex items-center gap-2 h-10 lg:h-11 px-6 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors">
                  Descargar certificado
                </button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-4 lg:p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#1e2d1c]">Progreso</h3>
              <div className="space-y-2">
                {steps.map((step) => {
                  const isDone =
                    (step.key === "material" && (currentStep === "quiz" || currentStep === "certificate")) ||
                    (step.key === "quiz" && currentStep === "certificate");
                  const isCurrent = currentStep === step.key;
                  return (
                    <div key={step.key} className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle className="h-4 w-4 text-[#2d4a2b]" aria-label="Completado" />
                      ) : (
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${isCurrent ? "border-[#2d4a2b]" : "border-[#dde0d4]"}`}
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={`text-sm ${
                          isDone ? "text-[#2d4a2b] font-medium" : isCurrent ? "text-[#1e2d1c] font-medium" : "text-[#6b7260]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-4 lg:p-5 space-y-2">
              <h3 className="text-sm font-semibold text-[#1e2d1c]">Informaci&oacute;n</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6b7260]">Preguntas</span>
                  <span className="text-[#1e2d1c] font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7260]">Nota m&iacute;nima</span>
                  <span className="text-[#1e2d1c] font-medium">
                    {quiz?.passing_score != null ? `${quiz.passing_score}%` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7260]">Intentos</span>
                  <span className="text-[#1e2d1c] font-medium">
                    {quiz?.max_attempts != null ? `${quiz.max_attempts} máximo` : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
