"use client";

import { useState, useEffect } from "react";
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
import { createClient } from "@/lib/supabase";
import { Download, History } from "lucide-react";

interface CompletedAssignment {
  id: string;
  score: number | null;
  completed_at: string | null;
  has_certificate: boolean;
  trainings: { title: string }[] | { title: string } | null;
}

export default function HistorialPage() {
  const [completed, setCompleted] = useState<CompletedAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("assignments")
        .select("id, score, completed_at, has_certificate, trainings(title)")
        .eq("user_id", user.id)
        .eq("status", "COMPLETED")
        .order("completed_at", { ascending: false });

      setCompleted(((data ?? []) as unknown) as CompletedAssignment[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-[#1e2d1c]">Historial</h1>
        <p className="text-sm text-[#6b7260] mt-1">Capacitaciones completadas y certificados obtenidos</p>
      </div>

      <Card className="border-[#dde0d4] shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-[#7d8471]">Cargando...</div>
          ) : completed.length > 0 ? (
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
                    {completed.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm font-medium text-[#1e2d1c]">
                          {(Array.isArray(a.trainings) ? a.trainings[0]?.title : a.trainings?.title) ?? "—"}
                        </TableCell>
                        <TableCell>
                          {a.score != null ? (
                            <Badge className="bg-[#f0f2eb] text-[#2d4a2b] hover:bg-[#f0f2eb]">
                              {a.score}%
                            </Badge>
                          ) : (
                            <span className="text-sm text-[#6b7260]">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-[#6b7260] whitespace-nowrap">
                          {a.completed_at ? new Date(a.completed_at).toLocaleDateString("es-CL") : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {a.has_certificate ? (
                            <button
                              aria-label={`Descargar certificado de ${(Array.isArray(a.trainings) ? a.trainings[0]?.title : a.trainings?.title) ?? ""}`}
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
                {completed.map((a) => (
                  <div key={a.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1e2d1c]">{(Array.isArray(a.trainings) ? a.trainings[0]?.title : a.trainings?.title) ?? "—"}</p>
                      {a.score != null && (
                        <Badge className="bg-[#f0f2eb] text-[#2d4a2b] hover:bg-[#f0f2eb] shrink-0">
                          {a.score}%
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#6b7260]">
                        {a.completed_at ? new Date(a.completed_at).toLocaleDateString("es-CL") : "—"}
                      </span>
                      {a.has_certificate ? (
                        <button
                          aria-label={`Descargar certificado de ${(Array.isArray(a.trainings) ? a.trainings[0]?.title : a.trainings?.title) ?? ""}`}
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
