"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { sedeName } from "@/lib/config";
import { BookOpen, Search, ChevronRight, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */
interface TrainingData {
  id: string;
  title: string;
  sede_id: string | null;
  target_area: string | null;
}

interface AssignmentRow {
  id: string;
  training_id: string;
  status: "IN_PROGRESS" | "COMPLETED";
  due_date: string | null;
  target_type: string;
  training: TrainingData | null;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  COMPLETED:   { label: "Completado",  dot: "#3c9d70", bg: "#dbeee3", text: "#1a6a43" },
  IN_PROGRESS: { label: "En progreso", dot: "#2d4a8a", bg: "#eaf0fb", text: "#2d4a8a" },
};

/* ─── Main Page ───────────────────────────────────────────────── */
export default function PortalPage() {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [userName, setUserName]       = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("sede_id, area, name")
        .eq("id", user.id)
        .single();

      if (profile?.name) setUserName((profile.name as string).split(" ")[0]);

      const conditions = ["target_type.eq.ALL"];
      conditions.push(`and(target_type.eq.INDIVIDUAL,user_id.eq.${user.id})`);
      if (profile?.sede_id) conditions.push(`and(target_type.eq.SEDE,target_sede_id.eq.${profile.sede_id})`);
      if (profile?.area)    conditions.push(`and(target_type.eq.AREA,target_area.eq.${profile.area})`);

      const [{ data: aData }, { data: cData }] = await Promise.all([
        supabase
          .from("assignments")
          .select("id, training_id, status, due_date, target_type, trainings(id, title, sede_id, target_area)")
          .or(conditions.join(",")),
        supabase.from("certificates").select("training_id").eq("user_id", user.id),
      ]);

      const completedIds = new Set((cData ?? []).map((c) => c.training_id));
      const seen         = new Set<string>();
      const rows: AssignmentRow[] = [];

      for (const a of aData ?? []) {
        if (seen.has(a.training_id)) continue;
        seen.add(a.training_id);
        const t = Array.isArray(a.trainings) ? (a.trainings[0] ?? null) : a.trainings;
        rows.push({
          id:          a.id,
          training_id: a.training_id,
          status:      completedIds.has(a.training_id) ? "COMPLETED" : "IN_PROGRESS",
          due_date:    a.due_date ?? null,
          target_type: a.target_type,
          training:    t as TrainingData | null,
        });
      }

      setAssignments(rows);
      setLoading(false);
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return assignments;
    const q = search.toLowerCase();
    return assignments.filter(
      (a) =>
        (a.training?.title ?? "").toLowerCase().includes(q) ||
        (sedeName(a.training?.sede_id ?? null) ?? "").toLowerCase().includes(q)
    );
  }, [assignments, search]);

  const completedCount = assignments.filter((a) => a.status === "COMPLETED").length;
  const totalCount     = assignments.length;
  const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const now = new Date();
  const inProgressCount = assignments.filter((a) => a.status === "IN_PROGRESS").length;
  const porVencerCount  = assignments.filter((a) => {
    if (!a.due_date || a.status === "COMPLETED") return false;
    const diff = (new Date(a.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const firstInProgress = assignments.find((a) => a.status === "IN_PROGRESS");

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();

  return (
    <div className="space-y-5">

      {/* ── Hero section ────────────────────────────────────────── */}
      <div
        className="rounded-[20px] relative overflow-hidden text-white p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 items-center animate-fade-in-up"
        style={{ background: "linear-gradient(115deg, #2d4a8a 0%, #1f3769 58%, #16284d 100%)" }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute right-[-60px] top-[-60px] w-[220px] h-[220px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,124,107,0.30), transparent 70%)" }} />
        <div aria-hidden="true" className="pointer-events-none absolute right-[110px] bottom-[-50px] w-[120px] h-[120px] rounded-full"
          style={{ background: "rgba(242,181,68,0.38)" }} />

        <div className="relative z-10 space-y-4">
          <p className="text-[10.5px] font-[700] uppercase tracking-[0.18em] text-white/60">{greeting}</p>
          <h1 className="text-[24px] lg:text-[28px] font-[800] tracking-[-0.025em] leading-[1.15] text-white">
            {userName ? (
              <>Hola, <em style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontStyle: "italic", fontWeight: 500, color: "#ffd4cc" }}>{userName}</em>.</>
            ) : (
              <>Tus <em style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontStyle: "italic", fontWeight: 500, color: "#ffd4cc" }}>capacitaciones</em>.</>
            )}
          </h1>
          <p className="text-[13px] text-white/70 leading-[1.55]">
            Tienes{" "}
            <strong className="text-white">{inProgressCount} {inProgressCount === 1 ? "capacitación" : "capacitaciones"} en progreso</strong>
            {porVencerCount > 0 && (
              <>, <strong className="text-[#ffd4cc]">{porVencerCount} por vencer</strong> esta semana</>
            )}.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {firstInProgress && (
              <Link
                href={`/portal/capacitacion/${firstInProgress.training_id}`}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors"
              >
                Continuar curso
              </Link>
            )}
            <Link
              href="/portal/historial"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] text-white text-[13px] font-[600] transition-all bg-white/10 hover:bg-white/20 border border-white/20"
            >
              Ver historial
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex justify-center relative z-10" aria-hidden="true">
          <svg viewBox="0 0 240 180" width="240" height="180">
            <circle cx="160" cy="80" r="70" fill="rgba(255,255,255,0.06)" />
            <circle cx="160" cy="80" r="48" fill="rgba(255,255,255,0.08)" />
            <circle cx="80" cy="130" r="36" fill="rgba(242,181,68,0.30)" />
            <circle cx="190" cy="40" r="20" fill="rgba(255,124,107,0.35)" />
          </svg>
        </div>
      </div>

      {/* ── Stat summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[16px] border border-[#e8e4dc] p-4 space-y-1.5" style={{ background: "#eaf0fb" }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-[700] uppercase tracking-[0.05em] text-[#6b7185]">Progreso</p>
            <TrendingUp className="h-3.5 w-3.5 text-[#2d4a8a]" aria-hidden="true" />
          </div>
          <p className="text-[26px] font-[800] tracking-[-0.03em] tabular-nums text-[#2d4a8a]">{pct}%</p>
          <div className="h-1.5 w-full rounded-full bg-[#c3d5f4] overflow-hidden">
            <div className="h-full rounded-full bg-[#2d4a8a] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="rounded-[16px] border border-[#e8e4dc] p-4 space-y-1.5" style={{ background: "#fdf1d8" }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-[700] uppercase tracking-[0.05em] text-[#6b7185]">Por vencer</p>
            <AlertCircle className="h-3.5 w-3.5 text-[#8a6410]" aria-hidden="true" />
          </div>
          <p className="text-[26px] font-[800] tracking-[-0.03em] tabular-nums text-[#15182b]">{porVencerCount}</p>
          <p className="text-[11px] text-[#6b7185]">próximos 7 días</p>
        </div>

        <div className="rounded-[16px] border border-[#e8e4dc] p-4 space-y-1.5" style={{ background: "#dbeee3" }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-[700] uppercase tracking-[0.05em] text-[#6b7185]">Completadas</p>
            <CheckCircle className="h-3.5 w-3.5 text-[#1a6a43]" aria-hidden="true" />
          </div>
          <p className="text-[26px] font-[800] tracking-[-0.03em] tabular-nums text-[#15182b]">{completedCount}</p>
          <p className="text-[11px] text-[#6b7185]">de {totalCount} asignadas</p>
        </div>
      </div>

      {/* ── Section title ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-[15px] font-[700] text-[#15182b]">Mis capacitaciones</h2>
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      {totalCount > 0 && (
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-[#a5a9b8]"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar capacitación…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl text-sm bg-white border border-[#e8e4dc] text-[#15182b] focus:outline-none focus:ring-2 focus:ring-[#2d4a8a]/25 focus:border-[#2d4a8a] transition-all"
          />
        </div>
      )}

      {/* ── Grid ────────────────────────────────────────────────── */}
      {loading ? (
        <GridSkeleton />
      ) : totalCount === 0 ? (
        <EmptyPortal />
      ) : (
        <div className="rounded-2xl overflow-hidden bg-white border border-[#e8e4dc] shadow-sm">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[1fr_148px_124px_120px_36px] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider border-b border-[#e8e4dc] bg-[#f6f3ee] text-[#a5a9b8]">
            <span>Capacitación</span>
            <span>Estado</span>
            <span>Sede</span>
            <span>Vence</span>
            <span />
          </div>

          {/* Data rows */}
          <div className="divide-y divide-[#e8e4dc]">
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-[#a5a9b8]">
                Sin resultados para &ldquo;{search}&rdquo;
              </div>
            ) : (
              filtered.map((row) => {
                const cfg      = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.IN_PROGRESS;
                const title    = row.training?.title ?? "Capacitación";
                const sName    = sedeName(row.training?.sede_id ?? null);
                const dueLabel = row.due_date
                  ? new Date(row.due_date).toLocaleDateString("es-CL", {
                      day: "numeric", month: "short", year: "numeric",
                    })
                  : "—";

                return (
                  <Link
                    key={row.id}
                    href={`/portal/capacitacion/${row.training_id}`}
                    className="group flex sm:grid sm:grid-cols-[1fr_148px_124px_120px_36px] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#f6f3ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2d4a8a]/40"
                  >
                    {/* Title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eaf0fb]">
                        <BookOpen className="h-4 w-4 text-[#2d4a8a]" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#15182b] truncate group-hover:text-[#2d4a8a] transition-colors">
                          {title}
                        </p>
                        {/* Mobile: inline status + sede */}
                        <div className="flex items-center gap-2 mt-1 sm:hidden">
                          <StatusBadge cfg={cfg} />
                          {sName && (
                            <span className="text-xs text-[#a5a9b8]">{sName}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status — desktop */}
                    <div className="hidden sm:flex items-center">
                      <StatusBadge cfg={cfg} />
                    </div>

                    {/* Sede — desktop */}
                    <div className="hidden sm:flex items-center">
                      <span className="text-xs font-medium text-[#6b7185]">
                        {sName || "—"}
                      </span>
                    </div>

                    {/* Due date — desktop */}
                    <div className="hidden sm:flex items-center">
                      <span className="text-xs text-[#6b7185]">{dueLabel}</span>
                    </div>

                    {/* Chevron */}
                    <div className="flex justify-end ml-auto sm:ml-0">
                      <ChevronRight
                        className="h-4 w-4 text-[#a5a9b8] group-hover:text-[#2d4a8a] transition-colors shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function StatusBadge({
  cfg,
}: {
  cfg: { label: string; dot: string; bg: string; text: string };
}) {
  return (
    <span
      style={{ background: cfg.bg, color: cfg.text }}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap"
    >
      <span
        style={{ background: cfg.dot }}
        className="h-1.5 w-1.5 rounded-full shrink-0"
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
}

function GridSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#e8e4dc]">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 px-4 py-3.5 ${i < 3 ? "border-b border-[#e8e4dc]" : ""}`}
        >
          <div className="h-8 w-8 rounded-lg bg-[#eaf0fb] animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-48 rounded-md bg-[#f0ece4] animate-pulse" />
            <div className="h-2.5 w-20 rounded-md bg-[#f0ece4] animate-pulse" />
          </div>
          <div className="hidden sm:block h-5 w-20 rounded-md bg-[#eaf0fb] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyPortal() {
  return (
    <div className="rounded-2xl bg-white border border-[#e8e4dc] shadow-sm px-6 py-16 text-center">
      <div className="h-14 w-14 rounded-2xl bg-[#eaf0fb] flex items-center justify-center mx-auto mb-4">
        <BookOpen className="h-7 w-7 text-[#2d4a8a]" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold text-[#15182b] mb-1">
        Sin capacitaciones asignadas
      </p>
      <p className="text-sm text-[#6b7185] max-w-xs mx-auto">
        Aún no tienes capacitaciones asignadas. Contacta a tu administrador.
      </p>
    </div>
  );
}
