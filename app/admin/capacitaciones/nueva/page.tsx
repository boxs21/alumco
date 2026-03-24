"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/layout/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEDES, AREAS, mockFiles } from "@/lib/mock-data";
import {
  Check,
  Upload,
  FileText,
  Video,
  Presentation,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const steps = [
  { number: 1, label: "Información básica" },
  { number: 2, label: "Material formativo" },
  { number: 3, label: "Evaluación" },
];

const fileTypeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  VIDEO: Video,
  PRESENTATION: Presentation,
};

export default function NuevaCapacitacionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSede, setSelectedSede] = useState("global");

  // Step 1 state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [sedeSelection, setSedeSelection] = useState<string | null>(null);

  // Step 3 state
  const [hasQuiz, setHasQuiz] = useState(false);
  const [passingScore, setPassingScore] = useState(60);
  const [questions, setQuestions] = useState([
    {
      id: "new-1",
      text: "",
      options: [
        { id: "no-1", text: "", isCorrect: false },
        { id: "no-2", text: "", isCorrect: false },
      ],
    },
  ]);

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

  const sedeOptions = [
    { key: "s1", label: SEDES.CONCEPCION.nombre, color: "border-[#a4ac86] bg-[#f0f2eb]", activeRing: "ring-[#2d4a2b]" },
    { key: "s2", label: SEDES.COYHAIQUE.nombre, color: "border-amber-300 bg-amber-50", activeRing: "ring-amber-500" },
    { key: "global", label: "Ambas sedes", color: "border-[#dde0d4] bg-[#faf9f6]", activeRing: "ring-[#7d8471]" },
  ];

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="Nueva capacitación" />

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    currentStep > step.number
                      ? "bg-[#2d4a2b] text-white"
                      : currentStep === step.number
                      ? "bg-[#2d4a2b] text-white"
                      : "bg-[#f0f2eb] text-[#a4ac86]"
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.number ? "text-[#1e2d1c]" : "text-[#a4ac86]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-px ${currentStep > step.number ? "bg-[#2d4a2b]" : "bg-[#dde0d4]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-[#1e2d1c]">
                  Título de la capacitación
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Protocolo de Higiene Personal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 text-base"
                />
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
                <div className="flex gap-2">
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

        {/* Step 2: Files */}
        {currentStep === 2 && (
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-6 space-y-5">
              {/* Drop zone */}
              <div className="border-2 border-dashed border-[#dde0d4] rounded-xl p-8 text-center hover:border-[#7d8471] hover:bg-[#f0f2eb]/30 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 text-[#a4ac86] mx-auto mb-3" />
                <p className="text-sm font-medium text-[#1e2d1c]">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-[#7d8471] mt-1">PDF, videos o presentaciones (máx. 50MB)</p>
              </div>

              {/* File list */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#1e2d1c]">Archivos del curso</Label>
                {mockFiles.map((file, index) => {
                  const FileIcon = fileTypeIcons[file.type] ?? FileText;
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[#dde0d4] bg-[#faf9f6]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2eb]">
                        <FileIcon className="h-4 w-4 text-[#7d8471]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1e2d1c] truncate">{file.name}</p>
                        <p className="text-xs text-[#a4ac86]">{file.size}</p>
                      </div>
                      <span className="text-xs text-[#a4ac86] tabular-nums">{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Quiz */}
        {currentStep === 3 && (
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-6 space-y-5">
              {/* Toggle */}
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
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    hasQuiz ? "bg-[#2d4a2b]" : "bg-[#dde0d4]"
                  }`}
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
                          <span className="text-sm font-semibold text-[#1e2d1c]">
                            Pregunta {qi + 1}
                          </span>
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
                            setQuestions(
                              questions.map((qq) =>
                                qq.id === q.id ? { ...qq, text: e.target.value } : qq
                              )
                            )
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
                                        ? {
                                            ...qq,
                                            options: qq.options.map((o, idx) => ({
                                              ...o,
                                              isCorrect: idx === oi,
                                            })),
                                          }
                                        : qq
                                    )
                                  )
                                }
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                  opt.isCorrect
                                    ? "border-[#2d4a2b] bg-[#2d4a2b]"
                                    : "border-[#dde0d4] hover:border-slate-400"
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
                                        ? {
                                            ...qq,
                                            options: qq.options.map((o) =>
                                              o.id === opt.id ? { ...o, text: e.target.value } : o
                                            ),
                                          }
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
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back())}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb]/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep > 1 ? "Anterior" : "Cancelar"}
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/admin/capacitaciones")}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors"
            >
              Crear capacitación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
