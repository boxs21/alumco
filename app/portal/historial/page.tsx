"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase";
import { Download, History, Award, Clock, TrendingUp } from "lucide-react";
import CertificatePreviewModal from "@/components/certificate/CertificatePreviewModal";

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
  const [previewCertId, setPreviewCertId] = useState<string | null>(null);

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

  const avgScore = useMemo(() => {
    const scores = certs.map(getScore).filter((s): s is number => s !== null);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [certs]);

  const estimatedHours = certs.length * 2;

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-[800] tracking-[-0.025em] text-[#15182b]">Mi historial</h1>
        <p className="text-[13px] text-[#6b7185] mt-0.5">Capacitaciones completadas y certificados obtenidos</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[16px] border border-[#e8e4dc] p-4 space-y-2" style={{ background: "#ffe6e1" }}>
          <div className="h-7 w-7 rounded-[9px] flex items-center justify-center" style={{ background: "#ffccc5" }}>
            <Award className="h-3.5 w-3.5 text-[#e86154]" aria-hidden="true" />
          </div>
          <p className="text-[26px] font-[800] tracking-[-0.03em] tabular-nums text-[#15182b]">
            {loading ? "—" : certs.length}
          </p>
          <p className="text-[11px] font-[600] text-[#6b7185]">Certificados</p>
        </div>

        <div className="rounded-[16px] border border-[#e8e4dc] p-4 space-y-2" style={{ background: "#fdf1d8" }}>
          <div className="h-7 w-7 rounded-[9px] flex items-center justify-center" style={{ background: "#fde8b0" }}>
            <Clock className="h-3.5 w-3.5 text-[#8a6410]" aria-hidden="true" />
          </div>
          <p className="text-[26px] font-[800] tracking-[-0.03em] tabular-nums text-[#15182b]">
            {loading ? "—" : `${estimatedHours}h`}
          </p>
          <p className="text-[11px] font-[600] text-[#6b7185]">Horas formación</p>
        </div>

        <div className="rounded-[16px] border border-[#e8e4dc] p-4 space-y-2" style={{ background: "#eaf0fb" }}>
          <div className="h-7 w-7 rounded-[9px] flex items-center justify-center" style={{ background: "#c3d5f4" }}>
            <TrendingUp className="h-3.5 w-3.5 text-[#2d4a8a]" aria-hidden="true" />
          </div>
          <p className="text-[26px] font-[800] tracking-[-0.03em] tabular-nums text-[#15182b]">
            {loading ? "—" : avgScore != null ? `${avgScore}%` : "—"}
          </p>
          <p className="text-[11px] font-[600] text-[#6b7185]">Nota promedio</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[16px] border border-[#e8e4dc] bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[13px] text-[#6b7185]">Cargando...</div>
        ) : certs.length > 0 ? (
          <>
            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f7f5f0] border-b border-[#e8e4dc] hover:bg-[#f7f5f0]">
                    <TableHead className="text-[10.5px] font-[700] uppercase tracking-[0.05em] text-[#6b7185]">Capacitación</TableHead>
                    <TableHead className="text-[10.5px] font-[700] uppercase tracking-[0.05em] text-[#6b7185]">Estado</TableHead>
                    <TableHead className="text-[10.5px] font-[700] uppercase tracking-[0.05em] text-[#6b7185]">Nota</TableHead>
                    <TableHead className="text-[10.5px] font-[700] uppercase tracking-[0.05em] text-[#6b7185]">Fecha</TableHead>
                    <TableHead className="text-[10.5px] font-[700] uppercase tracking-[0.05em] text-[#6b7185] text-right">Certificado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certs.map((c) => {
                    const score = getScore(c);
                    return (
                      <TableRow key={c.id} className="border-b border-[#f0ece4] hover:bg-[#f7f5f0]">
                        <TableCell className="text-[13px] font-[600] text-[#15182b]">{getTitle(c)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-[700] bg-[#dbeee3] text-[#1a6a43]">
                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                            Completado
                          </span>
                        </TableCell>
                        <TableCell>
                          {score != null ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-[700] bg-[#eaf0fb] text-[#2d4a8a]">
                              {score}%
                            </span>
                          ) : (
                            <span className="text-[13px] text-[#a5a9b8]">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#6b7185] whitespace-nowrap">
                          {c.issued_at ? new Date(c.issued_at).toLocaleDateString("es-CL") : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => setPreviewCertId(c.id)}
                            aria-label={`Ver certificado de ${getTitle(c)}`}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[9px] border border-[#e8e4dc] bg-[#f7f5f0] text-[12px] font-[600] text-[#15182b] hover:bg-[#eaf0fb] hover:border-[#c3d5f4] transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            Ver certificado
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-[#f0ece4]">
              {certs.map((c) => {
                const score = getScore(c);
                return (
                  <div key={c.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-[600] text-[#15182b]">{getTitle(c)}</p>
                      {score != null && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-[700] bg-[#eaf0fb] text-[#2d4a8a] shrink-0">
                          {score}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] text-[#6b7185]">
                        {c.issued_at ? new Date(c.issued_at).toLocaleDateString("es-CL") : "—"}
                      </span>
                      <button
                        onClick={() => setPreviewCertId(c.id)}
                        className="text-[12px] font-[600] text-[#2d4a8a] hover:text-[#15182b] transition-colors"
                      >
                        Ver certificado →
                      </button>
                    </div>                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <History className="h-10 w-10 text-[#e8e4dc] mb-3" aria-hidden="true" />
            <p className="text-[13px] font-[700] text-[#15182b]">Sin historial todavía</p>
            <p className="text-[12px] text-[#6b7185] mt-1">Completa capacitaciones para ver tu historial aquí</p>
          </div>
        )}
      </div>

      {previewCertId && (
        <CertificatePreviewModal
          certId={previewCertId}
          open={!!previewCertId}
          onClose={() => setPreviewCertId(null)}
        />
      )}
    </div>
  );
}
