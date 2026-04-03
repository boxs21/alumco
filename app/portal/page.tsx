"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SedeBadge from "@/components/shared/SedeBadge";
import { mockCollaboratorTrainings } from "@/lib/mock-data";
import { BookOpen, CheckCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

const statusConfig = {
  COMPLETED:   { label: "Completado",  icon: CheckCircle, className: "bg-[#f0f2eb] text-[#2d4a2b] hover:bg-[#f0f2eb]" },
  IN_PROGRESS: { label: "En progreso", icon: Clock,        className: "bg-[#fff8e8] text-[#9a6800] hover:bg-[#fff8e8]" },
};

export default function PortalPage() {
  const total = mockCollaboratorTrainings.length;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header — lean, no duplicate sede badge */}
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-[#1e2d1c]">Mis capacitaciones</h1>
        <p className="text-sm text-[#7d8471] mt-0.5">
          {total} capacitaci{total === 1 ? "ón asignada" : "ones asignadas"}
        </p>
      </div>

      {/* Training Grid — 1 col mobile, 2 cols sm, 3 cols xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {mockCollaboratorTrainings.map((training) => {
          const status = statusConfig[training.status];
          const StatusIcon = status.icon;
          const isInProgress = training.status === "IN_PROGRESS";

          return (
            <Link
              key={training.id}
              href={`/portal/capacitacion/${training.trainingId}`}
              className="block group"
            >
              <Card className="border-[#dde0d4] shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-[#a4ac86] h-full">
                <CardContent className="p-4 lg:p-5 flex flex-col gap-3 h-full">
                  {/* Top row: icon + status badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2eb]">
                      <BookOpen className="h-4 w-4 text-[#2d4a2b]" aria-hidden="true" />
                    </div>
                    <Badge className={status.className}>
                      <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                      {status.label}
                    </Badge>
                  </div>

                  {/* Title */}
                  <div className="flex-1">
                    <h3 className="text-sm lg:text-base font-semibold text-[#1e2d1c] group-hover:text-[#2d4a2b] transition-colors leading-snug">
                      {training.title}
                    </h3>
                  </div>

                  {/* Progress bar for in-progress cards */}
                  {isInProgress && training.progress != null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-[#7d8471]">
                        <span>Progreso</span>
                        <span className="font-medium text-[#1e2d1c]">{training.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#f0f2eb] overflow-hidden">
                        <div
                          className="h-1.5 rounded-full bg-[#f9a620] transition-all"
                          style={{ width: `${training.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom row: sede + score/affordance */}
                  <div className="flex items-center justify-between mt-auto pt-1 border-t border-[#f0f2eb]">
                    <div className="flex items-center gap-2">
                      <SedeBadge sedeId="s1" sedeName="Concepción" size="sm" />
                      {training.score != null && (
                        <span className="text-xs text-[#7d8471]">Aprobado · {training.score}%</span>
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
    </div>
  );
}
