"use client";

import { use, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockFiles, mockQuestions, mockCollaboratorTrainings } from "@/lib/mock-data";
import {
  FileText,
  Video,
  Presentation,
  Check,
  CheckCircle,
  Award,
  ArrowRight,
} from "lucide-react";

/** Íconos por tipo de archivo del material de estudio */
const fileTypeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  VIDEO: Video,
  PRESENTATION: Presentation,
};

/** Pasos del flujo de una capacitación en el portal */
type Step = "material" | "quiz" | "certificate";

/**
 * Página de realización de una capacitación en el portal del colaborador.
 * Flujo de 3 pasos: revisar material → rendir evaluación → obtener certificado.
 */
export default function CapacitacionPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [currentStep, setCurrentStep] = useState<Step>("material"); // paso activo
  const [answers, setAnswers] = useState<Record<string, string>>({}); // respuestas del quiz (qId → optId)
  const [submitted, setSubmitted] = useState(false); // true cuando el quiz ya fue enviado

  // Busca la capacitación asignada; usa la primera como fallback
  const training = mockCollaboratorTrainings.find((t) => t.trainingId === id) ?? mockCollaboratorTrainings[0];

  /** Definición de los pasos con etiquetas completas y cortas para móvil */
  const steps: { key: Step; label: string; shortLabel: string }[] = [
    { key: "material", label: "Revisar material", shortLabel: "Material" },
    { key: "quiz", label: "Rendir evaluación", shortLabel: "Evaluación" },
    { key: "certificate", label: "Obtener certificado", shortLabel: "Certificado" },
  ];

  /** Marca el quiz como enviado y avanza al paso del certificado */
  function handleSubmitQuiz() {
    setSubmitted(true);
    setCurrentStep("certificate");
  }

  // Nota simulada: 85% al completar el quiz
  const score = submitted ? 85 : null;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-[#1e2d1c]">{training.title}</h1>
      </div>

      {/* Step indicator — horizontal on sm+, compact on mobile */}
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
                currentStep === step.key
                  ? "bg-[#f0f2eb] text-[#1e2d1c]"
                  : "text-[#6b7260] hover:text-[#1e2d1c]"
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

      {/* Content: 1 col mobile, 3 cols lg (2+1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === "material" && (
            <Card className="border-[#dde0d4] shadow-sm">
              <CardContent className="p-4 lg:p-6 space-y-4">
                <h2 className="text-sm lg:text-base font-semibold text-[#1e2d1c]">Material de estudio</h2>
                {mockFiles.map((file) => {
                  const FileIcon = fileTypeIcons[file.type] ?? FileText;
                  return (
                    <div key={file.id} className="flex items-center gap-3 p-3 lg:p-4 rounded-lg border border-[#dde0d4] hover:bg-[#faf9f6] cursor-pointer transition-colors">
                      <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-lg bg-[#f0f2eb]">
                        <FileIcon className="h-4 w-4 lg:h-5 lg:w-5 text-[#6b7260]" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1e2d1c] truncate">{file.name}</p>
                        <p className="text-xs text-[#6b7260]">{file.size}</p>
                      </div>
                      <Badge className="bg-[#f0f2eb] text-[#6b7260] hover:bg-[#f0f2eb] hidden sm:inline-flex">{file.type}</Badge>
                    </div>
                  );
                })}
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
                {mockQuestions.map((q, qi) => (
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
                              answers[q.id] === opt.id
                                ? "border-[#2d4a2b] bg-[#2d4a2b]"
                                : "border-[#dde0d4]"
                            }`}
                          >
                            {answers[q.id] === opt.id && <Check className="h-3 w-3 text-white" />}
                          </div>
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(answers).length < mockQuestions.length}
                  className="inline-flex items-center gap-2 h-10 lg:h-11 px-6 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar respuestas
                </button>
              </CardContent>
            </Card>
          )}

          {currentStep === "certificate" && (
            <Card className="border-[#dde0d4] shadow-sm">
              <CardContent className="p-6 lg:p-8 text-center space-y-4">
                <div className="flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto">
                  <Award className="h-7 w-7 lg:h-8 lg:w-8 text-emerald-600" />
                </div>
                <h2 className="text-lg lg:text-xl font-semibold text-[#1e2d1c]">Capacitaci&oacute;n completada</h2>
                <p className="text-sm text-[#6b7260]">
                  Has obtenido una nota de <span className="font-semibold text-[#1e2d1c]">{score}%</span>.
                  Tu certificado est&aacute; listo para descargar.
                </p>
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
                        <CheckCircle className="h-4 w-4 text-emerald-500" aria-label="Completado" />
                      ) : (
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            isCurrent ? "border-[#2d4a2b]" : "border-[#dde0d4]"
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={`text-sm ${
                          isDone ? "text-emerald-600 font-medium" : isCurrent ? "text-[#1e2d1c] font-medium" : "text-[#6b7260]"
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
                  <span className="text-[#1e2d1c] font-medium">{mockQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7260]">Nota m&iacute;nima</span>
                  <span className="text-[#1e2d1c] font-medium">60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7260]">Intentos</span>
                  <span className="text-[#1e2d1c] font-medium">3 m&aacute;ximo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
