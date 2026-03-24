"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockCollaboratorTrainings } from "@/lib/mock-data";
import { Download, History } from "lucide-react";

export default function HistorialPage() {
  const completed = mockCollaboratorTrainings.filter((t) => t.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1e2d1c]">Historial</h1>
        <p className="text-sm text-[#7d8471] mt-1">
          Capacitaciones completadas y certificados obtenidos
        </p>
      </div>

      <Card className="border-[#dde0d4] shadow-sm">
        <CardContent className="p-0">
          {completed.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#faf9f6]">
                  <TableHead className="text-sm font-medium text-[#7d8471]">Capacitación</TableHead>
                  <TableHead className="text-sm font-medium text-[#7d8471]">Nota</TableHead>
                  <TableHead className="text-sm font-medium text-[#7d8471]">Fecha</TableHead>
                  <TableHead className="text-sm font-medium text-[#7d8471] text-right">Certificado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completed.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="text-sm font-medium text-[#1e2d1c]">
                      {training.title}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {training.score}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[#7d8471]">{training.date}</TableCell>
                    <TableCell className="text-right">
                      {training.hasCertificate ? (
                        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#1e2d1c] hover:bg-[#faf9f6] transition-colors">
                          <Download className="h-4 w-4" />
                          Descargar
                        </button>
                      ) : (
                        <span className="text-sm text-[#a4ac86]">No disponible</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <History className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-[#1e2d1c]">Sin historial todavía</p>
              <p className="text-xs text-[#7d8471] mt-1">Completa capacitaciones para ver tu historial aquí</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
