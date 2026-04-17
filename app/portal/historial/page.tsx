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

interface Certificate {
  id: string;
  pdf_url: string | null;
  issued_at: string | null;
  trainings: { title: string }[] | { title: string } | null;
  attempts: { score: number | null }[] | { score: number | null } | null;
}

export default function HistorialPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("certificates")
        .select("id, pdf_url, issued_at, trainings(title), attempts(score)")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      setCerts(((data ?? []) as unknown) as Certificate[]);
      setLoading(false);
    }
    load();
  }, []);

  function getTitle(c: Certificate): string {
    return (Array.isArray(c.trainings) ? c.trainings[0]?.title : c.trainings?.title) ?? "—";
  }

  function getScore(c: Certificate): number | null {
    const a = Array.isArray(c.attempts) ? c.attempts[0] : c.attempts;
    return a?.score ?? null;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-semibold text-[#1A2F6B]">Historial</h1>
        <p className="text-sm text-[#4A5C8A] mt-1">Capacitaciones completadas y certificados obtenidos</p>
      </div>

      <Card className="border-[#C8D4EC] shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-[#6B7AB0]">Cargando...</div>
          ) : certs.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#FAFBFF]">
                      <TableHead className="text-sm font-medium text-[#4A5C8A]">Capacitaci&oacute;n</TableHead>
                      <TableHead className="text-sm font-medium text-[#4A5C8A]">Nota</TableHead>
                      <TableHead className="text-sm font-medium text-[#4A5C8A]">Fecha</TableHead>
                      <TableHead className="text-sm font-medium text-[#4A5C8A] text-right">Certificado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certs.map((c) => {
                      const score = getScore(c);
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="text-sm font-medium text-[#1A2F6B]">{getTitle(c)}</TableCell>
                          <TableCell>
                            {score != null ? (
                              <Badge className="bg-[#EEF2FF] text-[#2B4BA8] hover:bg-[#EEF2FF]">
                                {score}%
                              </Badge>
                            ) : (
                              <span className="text-sm text-[#4A5C8A]">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-[#4A5C8A] whitespace-nowrap">
                            {c.issued_at ? new Date(c.issued_at).toLocaleDateString("es-CL") : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {c.pdf_url ? (
                              <a
                                href={c.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Descargar certificado de ${getTitle(c)}`}
                                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#C8D4EC] bg-[#FAFBFF] text-sm font-medium text-[#1A2F6B] hover:bg-[#EEF2FF] transition-colors"
                              >
                                <Download className="h-4 w-4" aria-hidden="true" />
                                Descargar
                              </a>
                            ) : (
                              <span className="text-sm text-[#4A5C8A]">Sin PDF</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-[#C8D4EC]">
                {certs.map((c) => {
                  const score = getScore(c);
                  return (
                    <div key={c.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[#1A2F6B]">{getTitle(c)}</p>
                        {score != null && (
                          <Badge className="bg-[#EEF2FF] text-[#2B4BA8] hover:bg-[#EEF2FF] shrink-0">
                            {score}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#4A5C8A]">
                          {c.issued_at ? new Date(c.issued_at).toLocaleDateString("es-CL") : "—"}
                        </span>
                        {c.pdf_url ? (
                          <a
                            href={c.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Descargar certificado de ${getTitle(c)}`}
                            className="text-xs font-medium text-[#2B4BA8] hover:text-[#1A2F6B] transition-colors"
                          >
                            Descargar certificado →
                          </a>
                        ) : (
                          <span className="text-xs text-[#4A5C8A]">Sin certificado</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <History className="h-10 w-10 text-[#C8D4EC] mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-[#1A2F6B]">Sin historial todav&iacute;a</p>
              <p className="text-xs text-[#4A5C8A] mt-1">Completa capacitaciones para ver tu historial aqu&iacute;</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
