"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/layout/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEDES, AREAS } from "@/lib/config";
import { createClient } from "@/lib/supabase";
import {
  Check,
  Upload,
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Video,
  Link as LinkIcon,
  X,
  Loader2,
} from "lucide-react";

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const gdMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
  return null;
}

function detectVideoSource(url: string): "youtube" | "gdrive" | null {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/drive\.google\.com/.test(url)) return "gdrive";
  return null;
}

const steps = [
  { number: 1, label: "Información básica" },
  { number: 2, label: "Material formativo" },
  { number: 3, label: "Evaluación" },
];

interface VideoLink { id: string; url: string; embedUrl: string; source: "youtube" | "gdrive" }
interface Question {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export default function NuevaCapacitacionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSede, setSelectedSede] = useState("global");
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Step 1
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [sedeSelection, setSedeSelection] = useState<string | null>(null);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const previewEmbed = videoUrl.trim() ? getEmbedUrl(videoUrl.trim()) : null;

  function addVideoLink() {
    const embed = getEmbedUrl(videoUrl.trim());
    const source = detectVideoSource(videoUrl.trim());
    if (!embed || !source) return;
    setVideoLinks([...videoLinks, { id: `v-${Date.now()}`, url: videoUrl.trim(), embedUrl: embed, source }]);
    setVideoUrl("");
  }

  function removeVideoLink(id: string) {
    setVideoLinks(videoLinks.filter((v) => v.id !== id));
  }

  // Step 3
  const [hasQuiz, setHasQuiz] = useState(false);
  const [passingScore, setPassingScore] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "new-1",
      text: "",
      options: [
        { id: "no-1", text: "", isCorrect: false },
        { id: "no-2", text: "", isCorrect: false },
      ],
    },
  ]);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  function addQuestion() {
    const qId = `new-${Date.now()}`;
    setQuestions([
      ...questions,
      {
        id: qId,
        text: "",
        options: [
          { id: `no-${Date.now()}-1`, text: "", isCorrect: false },
          { id: `no-${Date.now()}-2`, text: "", isCorrect: false },
        ],
      },
    ]);
  }

  function removeQuestion(qId: string) {
    setQuestions(questions.filter((q) => q.id !== qId));
  }

  function addOption(qId: string) {
    setQuestions(
      questions.map((q) =>
        q.id === qId
          ? { ...q, options: [...q.options, { id: `no-${Date.now()}`, text: "", isCorrect: false }] }
          : q
      )
    );
  }

  function goToStep2() {
    if (!title.trim()) {
      setStep1Error("El título es requerido para continuar");
      return;
    }
    setStep1Error(null);
    setCurrentStep(2);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    const supabase = createClient();
    const sedeId = !sedeSelection || sedeSelection === "global" ? null : sedeSelection;
    // Pre-generate ID so we don't depend on Supabase returning the row
    const trainingId = crypto.randomUUID();

    // 1. Insert training
    const { error: trainingError } = await supabase
      .from("trainings")
      .insert({
        id: trainingId,
        title: title.trim(),
        target_area: area || null,
        status: "DRAFT",
        sede_id: sedeId,
        ...(hasQuiz ? { passing_score: passingScore } : {}),
      });

    if (trainingError) {
      setSaveError(`Error al guardar: ${trainingError.message}`);
      setSaving(false);
      return;
    }

    // 2. Insert video links as training_files
    if (videoLinks.length > 0) {
      await supabase.from("training_files").insert(
        videoLinks.map((v) => ({
          training_id: trainingId,
          name: v.source === "youtube" ? "Video de YouTube" : "Video de Google Drive",
          type: "VIDEO",
          url: v.url,
          size_label: null,
        }))
      );
    }

    // 3. Insert questions if quiz enabled
    if (hasQuiz) {
      const questionRows = questions
        .filter((q) => q.text.trim())
        .map((q, i) => ({
          training_id: trainingId,
          question_text: q.text.trim(),
          options: q.options.map((o) => ({ id: o.id, text: o.text, is_correct: o.isCorrect })),
          order: i + 1,
        }));
      if (questionRows.length > 0) {
        await supabase.from("training_questions").insert(questionRows);
      }
    }

    router.push("/admin/capacitaciones");
  }

  const sedeOptions = [
    { key: SEDES.CONCEPCION.id, label: SEDES.CONCEPCION.nombre, color: "border-[#a4ac86] bg-[#f0f2eb]", activeRing: "ring-[#2d4a2b]" },
    { key: SEDES.COYHAIQUE.id,  label: SEDES.COYHAIQUE.nombre,  color: "border-amber-300 bg-amber-50",   activeRing: "ring-amber-500" },
    { key: "global",            label: "Ambas sedes",           color: "border-[#dde0d4] bg-[#faf9f6]",  activeRing: "ring-[#7d8471]" },
  ];

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="Nueva capacitación" />

      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4 lg:space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-sm font-medium transition-colors shrink-0 ${
                    currentStep >= step.number ? "bg-[#2d4a2b] text-white" : "bg-[#f0f2eb] text-[#a4ac86]"
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-3.5 w-3.5" /> : step.number}
                </div>
                <span
                  className={`hidden sm:inline text-sm font-medium ${
                    currentStep >= step.number ? "text-[#1e2d1c]" : "text-[#a4ac86]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-px ${currentStep > step.number ? "bg-[#2d4a2b]" : "bg-[#dde0d4]"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="sm:hidden text-center text-sm font-medium text-[#1e2d1c]">
          Paso {currentStep}: {steps[currentStep - 1].label}
        </p>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-[#1e2d1c]">
                  Título de la capacitación <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Protocolo de Higiene Personal"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (step1Error) setStep1Error(null); }}
                  className={`h-11 text-base ${step1Error ? "border-red-400 focus:ring-red-300" : ""}`}
                />
                {step1Error && <p className="text-xs text-red-500">{step1Error}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-[#1e2d1c]">
                  Descripción
                </Label>
                <textarea
                  id="description"
                  placeholder="Describe brevemente el contenido de esta capacitación..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#dde0d4] px-3 py-2 text-base text-[#1e2d1c] placeholder:text-[#a4ac86] focus:outline-none focus:ring-2 focus:ring-[#2d4a2b] focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#1e2d1c]">Área</Label>
                <div className="flex flex-wrap gap-2">
                  {AREAS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setArea(a)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        area === a
                          ? "border-[#a4ac86] bg-[#f0f2eb] text-[#1e2d1c]"
                          : "border-[#dde0d4] bg-[#faf9f6] text-[#7d8471] hover:bg-[#f0f2eb]/60"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setArea("Todos")}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      area === "Todos"
                        ? "border-[#a4ac86] bg-[#f0f2eb] text-[#1e2d1c]"
                        : "border-[#dde0d4] bg-[#faf9f6] text-[#7d8471] hover:bg-[#f0f2eb]/60"
                    }`}
                  >
                    Todos
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#1e2d1c]">Sede</Label>
                <div className="grid grid-cols-3 gap-3">
                  {sedeOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSedeSelection(opt.key)}
                      className={`p-4 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                        sedeSelection === opt.key
                          ? `${opt.color} ring-2 ${opt.activeRing}`
                          : "border-[#dde0d4] bg-[#faf9f6] text-[#7d8471] hover:bg-[#f0f2eb]/60"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Material */}
        {currentStep === 2 && (
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-6 space-y-5">
              {/* File dropzone */}
              <div className="border-2 border-dashed border-[#dde0d4] rounded-xl p-8 text-center hover:border-[#7d8471] hover:bg-[#f0f2eb]/30 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 text-[#a4ac86] mx-auto mb-3" />
                <p className="text-sm font-medium text-[#1e2d1c]">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-[#7d8471] mt-1">PDF o presentaciones (máx. 50MB)</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#dde0d4]" />
                <span className="text-xs text-[#a4ac86] font-medium">o agregar link de video</span>
                <div className="flex-1 h-px bg-[#dde0d4]" />
              </div>

              {/* Video URL input */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a4ac86]" aria-hidden="true" />
                    <Input
                      placeholder="Pegar link de YouTube o Google Drive..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && previewEmbed && addVideoLink()}
                      className="h-11 pl-9 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addVideoLink}
                    disabled={!previewEmbed}
                    className="h-11 px-4 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    Agregar
                  </button>
                </div>

                {videoUrl.trim() && (
                  <div className="rounded-lg border border-[#dde0d4] overflow-hidden bg-[#faf9f6]">
                    {previewEmbed ? (
                      <iframe
                        src={previewEmbed}
                        title="Vista previa del video"
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 text-sm text-[#a4ac86]">
                        <Video className="h-4 w-4 shrink-0" />
                        <span>Link no reconocido. Usa YouTube o Google Drive.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {videoLinks.length > 0 ? (
                <div className="space-y-2">
                  {videoLinks.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#dde0d4] bg-[#faf9f6]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2eb] shrink-0">
                        <Video className="h-4 w-4 text-[#6b7260]" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1e2d1c] truncate">
                          {v.source === "youtube" ? "Video de YouTube" : "Video de Google Drive"}
                        </p>
                        <p className="text-xs text-[#7d8471] truncate">{v.url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideoLink(v.id)}
                        aria-label="Eliminar video"
                        className="text-[#a4ac86] hover:text-red-500 transition-colors shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 text-center">
                  <FileText className="h-8 w-8 text-[#dde0d4] mb-2" aria-hidden="true" />
                  <p className="text-sm text-[#7d8471]">No hay material cargado todavía.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Quiz */}
        {currentStep === 3 && (
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1e2d1c]">Incluir evaluación</p>
                  <p className="text-xs text-[#7d8471] mt-0.5">
                    Los colaboradores deberán aprobar para obtener su certificado
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHasQuiz(!hasQuiz)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${hasQuiz ? "bg-[#2d4a2b]" : "bg-[#dde0d4]"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-[#faf9f6] shadow transition-transform ${
                      hasQuiz ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {hasQuiz && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#1e2d1c]">
                      Nota mínima de aprobación (%)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      className="h-11 text-base w-32"
                    />
                  </div>

                  <div className="space-y-4">
                    {questions.map((q, qi) => (
                      <div key={q.id} className="p-4 rounded-lg border border-[#dde0d4] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#1e2d1c]">Pregunta {qi + 1}</span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(q.id)}
                              className="text-[#a4ac86] hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <Input
                          placeholder="Escribe la pregunta..."
                          value={q.text}
                          onChange={(e) =>
                            setQuestions(questions.map((qq) => qq.id === q.id ? { ...qq, text: e.target.value } : qq))
                          }
                          className="h-11 text-base"
                        />
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setQuestions(
                                    questions.map((qq) =>
                                      qq.id === q.id
                                        ? { ...qq, options: qq.options.map((o, idx) => ({ ...o, isCorrect: idx === oi })) }
                                        : qq
                                    )
                                  )
                                }
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                  opt.isCorrect ? "border-[#2d4a2b] bg-[#2d4a2b]" : "border-[#dde0d4] hover:border-slate-400"
                                }`}
                              >
                                {opt.isCorrect && <Check className="h-3 w-3 text-white" />}
                              </button>
                              <Input
                                placeholder={`Opción ${oi + 1}`}
                                value={opt.text}
                                onChange={(e) =>
                                  setQuestions(
                                    questions.map((qq) =>
                                      qq.id === q.id
                                        ? { ...qq, options: qq.options.map((o) => o.id === opt.id ? { ...o, text: e.target.value } : o) }
                                        : qq
                                    )
                                  )
                                }
                                className="h-10 text-sm flex-1"
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(q.id)}
                            className="text-sm text-[#2d4a2b] hover:text-[#1e2d1c] font-medium"
                          >
                            + Agregar opción
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center gap-2 text-sm text-[#2d4a2b] hover:text-[#1e2d1c] font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar pregunta
                    </button>
                  </div>
                </>
              )}

              {saveError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {saveError}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={saving}
            onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back())}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb] transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep > 1 ? "Anterior" : "Cancelar"}
          </button>

          {currentStep === 1 && (
            <button
              type="button"
              onClick={goToStep2}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar capacitación"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
