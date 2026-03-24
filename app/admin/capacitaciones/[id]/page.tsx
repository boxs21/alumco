"use client";

import { use, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockTrainings, mockFiles, mockUsers, mockQuestions } from "@/lib/mock-data";
import {
  Users,
  CheckCircle,
  TrendingUp,
  FileText,
  Video,
  Presentation,
  ClipboardList,
  UserPlus,
} from "lucide-react";
const fileTypeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  VIDEO: Video,
  PRESENTATION: Presentation,
};

const statusConfig = {
  DRAFT: { label: "Borrador", className: "bg-[#f0f2eb] text-[#7d8471]" },
  PUBLISHED: { label: "Publicado", className: "bg-emerald-50 text-emerald-700" },
  ARCHIVED: { label: "Archivado", className: "bg-red-50 text-red-600" },
};

export default function CapacitacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedSede, setSelectedSede] = useState("global");

  const training = mockTrainings.find((t) => t.id === id) ?? mockTrainings[0];
  const statusInfo = statusConfig[training.status];
  const progress = training.asignados > 0 ? Math.round((training.completados / training.asignados) * 100) : 0;
  const assignedUsers = mockUsers.filter((u) => u.role === "COLLABORATOR").slice(0, 4);

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#1e2d1c]">{training.title}</h1>
              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <SedeBadge sedeId={training.sedeId} sedeName={training.sedeName} />
              <span className="text-sm text-[#7d8471]">Área: {training.area}</span>
            </div>
          </div>
          <Link
            href={`/admin/capacitaciones/${id}/asignar`}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Asignar colaboradores
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Asignados" value={training.asignados} icon={Users} />
          <StatCard title="Completados" value={training.completados} icon={CheckCircle} />
          <StatCard title="Cumplimiento" value={`${progress}%`} icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Material */}
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-[#1e2d1c] mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#a4ac86]" />
                Material formativo
              </h2>
              <div className="space-y-2">
                {mockFiles.map((file) => {
                  const FileIcon = fileTypeIcons[file.type] ?? FileText;
                  return (
                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#dde0d4]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2eb]">
                        <FileIcon className="h-4 w-4 text-[#7d8471]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1e2d1c]">{file.name}</p>
                        <p className="text-xs text-[#a4ac86]">{file.size}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quiz summary */}
          <Card className="border-[#dde0d4] shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-[#1e2d1c] mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#a4ac86]" />
                Evaluación
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7d8471]">Preguntas</span>
                  <span className="font-medium text-[#1e2d1c]">{mockQuestions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#7d8471]">Nota mínima</span>
                  <span className="font-medium text-[#1e2d1c]">60%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#7d8471]">Intentos máximos</span>
                  <span className="font-medium text-[#1e2d1c]">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Users */}
        <Card className="border-[#dde0d4] shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-[#1e2d1c] mb-4">Colaboradores asignados</h2>
            <div className="space-y-2">
              {assignedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-[#dde0d4]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1e2d1c]">{user.name}</p>
                      <p className="text-xs text-[#7d8471]">{user.area}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SedeBadge sedeId={user.sedeId} sedeName={user.sedeName} size="sm" />
                    <Badge className={user.completadas > 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                      {user.completadas > 0 ? "Completado" : "Pendiente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
