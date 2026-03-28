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

/**
 * Página de historial de capacitaciones del colaborador.
 * Muestra las capacitaciones completadas con nota y opción de descargar el certificado.
 */
export default function HistorialPage() {
  // Filtra solo las capacitaciones que el colaborador ya completó
  const completed = mockCollaboratorTrainings.filter((t) => t.status === "COMPLETED");

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-[#1e2d1c]">Historial</h1>
        <p className="text-sm text-[#6b7260] mt-1">
          Capacitaciones completadas y certificados obtenidos
        </p>
      </div>

      <Card className="border-[#dde0d4] shadow-sm">
        <CardContent className="p-0">
          {completed.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#faf9f6]">
                      <TableHead className="text-sm font-medium text-[#6b7260]">Capacitaci&oacute;n</TableHead>
                      <TableHead className="text-sm font-medium text-[#6b7260]">Nota</TableHead>
                      <TableHead className="text-sm font-medium text-[#6b7260]">Fecha</TableHead>
                      <TableHead className="text-sm font-medium text-[#6b7260] text-right">Certificado</TableHead>
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
                        <TableCell className="text-sm text-[#6b7260] whitespace-nowrap">{training.date}</TableCell>
                        <TableCell className="text-right">
                          {training.hasCertificate ? (
                            <button
                              aria-label={`Descargar certificado de ${training.title}`}
                              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb] transition-colors cursor-pointer"
                            >
                              <Download className="h-4 w-4" aria-hidden="true" />
                              Descargar
                            </button>
                          ) : (
                            <span className="text-sm text-[#6b7260]">No disponible</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-[#dde0d4]">
                {completed.map((training) => (
                  <div key={training.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1e2d1c]">{training.title}</p>
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 shrink-0">
                        {training.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#6b7260]">{training.date}</span>
                      {training.hasCertificate ? (
                        <button
                          aria-label={`Descargar certificado de ${training.title}`}
                          className="text-xs font-medium text-[#2d4a2b] hover:text-[#1e2d1c] transition-colors cursor-pointer"
                        >
                          Descargar certificado →
                        </button>
                      ) : (
                        <span className="text-xs text-[#6b7260]">Sin certificado</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <History className="h-10 w-10 text-[#dde0d4] mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-[#1e2d1c]">Sin historial todav&iacute;a</p>
              <p className="text-xs text-[#6b7260] mt-1">Completa capacitaciones para ver tu historial aqu&iacute;</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
