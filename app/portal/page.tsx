"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SedeBadge from "@/components/shared/SedeBadge";
import EmptyState from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase";
import { sedeName } from "@/lib/config";
import { BookOpen, CheckCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface TrainingData {
  id: string;
  title: string;
  sede_id: string | null;
}

interface AssignmentWithTraining {
  id: string;
  training_id: string;
  status: "IN_PROGRESS" | "COMPLETED";
  score: number | null;
  progress: number;
  trainings: TrainingData[] | TrainingData | null;
}

const statusConfig = {
  COMPLETED:   { label: "Completado",  icon: CheckCircle, className: "bg-[#f0f2eb] text-[#2d4a2b] hover:bg-[#f0f2eb]" },
  IN_PROGRESS: { label: "En progreso", icon: Clock,        className: "bg-[#fff8e8] text-[#9a6800] hover:bg-[#fff8e8]" },
};

export default function PortalPage() {
  const [assignments, setAssignments] = useState<AssignmentWithTraining[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("assignments")
        .select("id, training_id, status, score, progress, trainings(id, title, sede_id)")
        .eq("user_id", user.id);

      setAssignments((data as AssignmentWithTraining[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const total = assignments.length;

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-[#1e2d1c]">Mis capacitaciones</h1>
        </div>
        <div className="text-sm text-[#7d8471] py-8 text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-[#1e2d1c]">Mis capacitaciones</h1>
        <p className="text-sm text-[#7d8471] mt-0.5">
          {total} capacitaci{total === 1 ? "ón asignada" : "ones asignadas"}
        </p>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sin capacitaciones asignadas"
          description="Aún no tienes capacitaciones asignadas. Contacta a tu administrador."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
          {assignments.map((assignment) => {
            const training = Array.isArray(assignment.trainings) ? assignment.trainings[0] ?? null : assignment.trainings;
            const statusKey = assignment.status in statusConfig ? assignment.status : "IN_PROGRESS";
            const status = statusConfig[statusKey as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            const isInProgress = assignment.status === "IN_PROGRESS";
            const title = training?.title ?? "Capacitación";
            const sedeId = training?.sede_id ?? null;

            return (
              <Link
                key={assignment.id}
                href={`/portal/capacitacion/${assignment.training_id}`}
                className="block group"
              >
                <Card className="border-[#dde0d4] shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-[#a4ac86] h-full">
                  <CardContent className="p-4 lg:p-5 flex flex-col gap-3 h-full">
                    <div className="flex items-start justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2eb]">
                        <BookOpen className="h-4 w-4 text-[#2d4a2b]" aria-hidden="true" />
                      </div>
                      <Badge className={status.className}>
                        <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                        {status.label}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm lg:text-base font-semibold text-[#1e2d1c] group-hover:text-[#2d4a2b] transition-colors leading-snug">
                        {title}
                      </h3>
                    </div>

                    {isInProgress && assignment.progress != null && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[#7d8471]">
                          <span>Progreso</span>
                          <span className="font-medium text-[#1e2d1c]">{assignment.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#f0f2eb] overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-[#f9a620] transition-all"
                            style={{ width: `${assignment.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-1 border-t border-[#f0f2eb]">
                      <div className="flex items-center gap-2">
                        <SedeBadge sedeId={sedeId} sedeName={sedeName(sedeId)} size="sm" />
                        {assignment.score != null && (
                          <span className="text-xs text-[#7d8471]">Aprobado · {assignment.score}%</span>
                        )}
                      </div>
                      <ChevronRight
                        className="h-4 w-4 text-[#a4ac86] group-hover:text-[#2d4a2b] transition-colors"
                        aria-hidden="true"
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
