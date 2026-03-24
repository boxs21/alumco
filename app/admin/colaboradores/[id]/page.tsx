"use client";

import { use, useState } from "react";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockUsers, mockCollaboratorTrainings } from "@/lib/mock-data";
import { BookOpen, CheckCircle, Star, Award, Download } from "lucide-react";
export default function ColaboradorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedSede, setSelectedSede] = useState("global");

  const user = mockUsers.find((u) => u.id === id) ?? mockUsers[0];
  const initials = user.name.split(" ").map((n) => n[0]).join("");
  const completed = mockCollaboratorTrainings.filter((t) => t.status === "COMPLETED");
  const certificates = completed.filter((t) => t.hasCertificate);

  return (
    <div>
      <Topbar selectedSede={selectedSede} onSedeChange={setSelectedSede} title="" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-[#f0f2eb] text-[#1e2d1c] text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#1e2d1c]">{user.name}</h1>
              <Badge
                className={
                  user.active
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                    : "bg-[#f0f2eb] text-[#7d8471] hover:bg-[#f0f2eb]"
                }
              >
                {user.active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#7d8471]">
              <span>{user.area}</span>
              <span>·</span>
              <span>{user.email}</span>
              <span>·</span>
              <SedeBadge sedeId={user.sedeId} sedeName={user.sedeName} size="sm" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Asignadas" value={mockCollaboratorTrainings.length} icon={BookOpen} />
          <StatCard title="Completadas" value={completed.length} icon={CheckCircle} />
          <StatCard title="Nota promedio" value={user.nota ? `${user.nota}%` : "—"} icon={Star} />
          <StatCard title="Certificados" value={certificates.length} icon={Award} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trainings">
          <TabsList className="bg-[#f0f2eb]">
            <TabsTrigger value="trainings" className="text-sm">Capacitaciones</TabsTrigger>
            <TabsTrigger value="certificates" className="text-sm">Certificados</TabsTrigger>
          </TabsList>

          <TabsContent value="trainings" className="mt-4">
            <div className="rounded-xl border border-[#dde0d4] bg-[#faf9f6] shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#faf9f6]">
                    <TableHead className="text-sm font-medium text-[#7d8471]">Capacitación</TableHead>
                    <TableHead className="text-sm font-medium text-[#7d8471]">Estado</TableHead>
                    <TableHead className="text-sm font-medium text-[#7d8471]">Nota</TableHead>
                    <TableHead className="text-sm font-medium text-[#7d8471]">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCollaboratorTrainings.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm font-medium text-[#1e2d1c]">{t.title}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            t.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                          }
                        >
                          {t.status === "COMPLETED" ? "Completado" : "En progreso"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#1e2d1c]">
                        {t.score ? `${t.score}%` : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-[#7d8471]">
                        {t.date ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="mt-4">
            <div className="rounded-xl border border-[#dde0d4] bg-[#faf9f6] shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#faf9f6]">
                    <TableHead className="text-sm font-medium text-[#7d8471]">Capacitación</TableHead>
                    <TableHead className="text-sm font-medium text-[#7d8471]">Nota</TableHead>
                    <TableHead className="text-sm font-medium text-[#7d8471]">Fecha</TableHead>
                    <TableHead className="text-sm font-medium text-[#7d8471] text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm font-medium text-[#1e2d1c]">{t.title}</TableCell>
                      <TableCell className="text-sm text-[#1e2d1c]">{t.score}%</TableCell>
                      <TableCell className="text-sm text-[#7d8471]">{t.date}</TableCell>
                      <TableCell className="text-right">
                        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb]/60 transition-colors">
                          <Download className="h-4 w-4" />
                          Descargar
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
