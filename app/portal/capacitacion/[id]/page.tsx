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

  const training = mockCollaboratorTrainings.find((t) => t.trainingId === id) ?? mockCollaboratorTrainings[0];

  const steps: { key: Step; label: string }[] = [
    { key: "material", label: "Revisar material" },
    { key: "quiz", label: "Rendir evaluación" },
    { key: "certificate", label: "Obtener certificado" },
  ];

  function handleSubmitQuiz() {
    setSubmitted(true);
    setCurrentStep("certificate");
  }

  const score = submitted ? 85 : null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1e2d1c]">{training.title}</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (step.key === "certificate" && !submitted) return;
                setCurrentStep(step.key);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === step.key
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-[#7d8471] hover:text-[#1e2d1c]"
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  (step.key === "material" && (currentStep === "quiz" || currentStep === "certificate")) ||
                  (step.key === "quiz" && currentStep === "certificate")
                    ? "bg-indigo-500 text-white"
                    : currentStep === step.key
                    ? "bg-indigo-500 text-white"
                    : "bg-[#dde0d4] text-[#7d8471]"
                }`}
              >
                {(step.key === "material" && (currentStep === "quiz" || currentStep === "certificate")) ||
                (step.key === "quiz" && currentStep === "certificate") ? (
                  <Check className="h-3 w-3" />
                ) : (
                  i + 1
                )}
              </div>
              {step.label}
            </button>
            {i < steps.length - 1 && <div className="w-8 h-px bg-[#dde0d4]" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2">
          {currentStep === "material" && (
            <Card className="border-[#dde0d4] shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-base font-semibold text-[#1e2d1c]">Material de estudio</h2>
                {mockFiles.map((file) => {
                  const FileIcon = fileTypeIcons[file.type] ?? FileText;
                  return (
                    <div key={file.id} className="flex items-center gap-3 p-4 rounded-lg border border-[#dde0d4] hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0f2eb]">
                        <FileIcon className="h-5 w-5 text-[#7d8471]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1e2d1c]">{file.name}</p>
                        <p className="text-xs text-[#a4ac86]">{file.size}</p>
                      </div>
                      <Badge className="bg-[#f0f2eb] text-[#7d8471] hover:bg-[#f0f2eb]">{file.type}</Badge>
                    </div>
                  );
                })}
                <button
                  onClick={() => setCurrentStep("quiz")}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors mt-2"
                >
                  Continuar a la evaluación
                  <ArrowRight className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          )}

          {currentStep === "quiz" && !submitted && (
            <Card className="border-[#dde0d4] shadow-sm">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-base font-semibold text-[#1e2d1c]">Evaluación</h2>
                {mockQuestions.map((q, qi) => (
                  <div key={q.id} className="space-y-3">
                    <p className="text-sm font-semibold text-[#1e2d1c]">
                      {qi + 1}. {q.text}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                          className={`flex items-center gap-3 w-full p-3 rounded-lg border text-left text-sm transition-colors ${
                            answers[q.id] === opt.id
                              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                              : "border-[#dde0d4] text-[#1e2d1c] hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              answers[q.id] === opt.id
                                ? "border-indigo-500 bg-indigo-500"
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
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar respuestas
                </button>
              </CardContent>
            </Card>
          )}

          {currentStep === "certificate" && (
            <Card className="border-[#dde0d4] shadow-sm">
              <CardContent className="p-8 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto">
                  <Award className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#1e2d1c]">Capacitación completada</h2>
                <p className="text-sm text-[#7d8471]">
                  Has obtenido una nota de <span className="font-semibold text-[#1e2d1c]">{score}%</span>.
                  Tu certificado está listo para descargar.
                </p>
                <button className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
                  Descargar certificado
                </button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-5 space-y-3">
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
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            isCurrent ? "border-indigo-500" : "border-[#dde0d4]"
                          }`}
                        />
                      )}
                      <span
                        className={`text-sm ${
                          isDone ? "text-emerald-600 font-medium" : isCurrent ? "text-[#1e2d1c] font-medium" : "text-[#a4ac86]"
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
            <CardContent className="p-5 space-y-2">
              <h3 className="text-sm font-semibold text-[#1e2d1c]">Información</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#7d8471]">Preguntas</span>
                  <span className="text-[#1e2d1c] font-medium">{mockQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d8471]">Nota mínima</span>
                  <span className="text-[#1e2d1c] font-medium">60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d8471]">Intentos</span>
                  <span className="text-[#1e2d1c] font-medium">3 máximo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
