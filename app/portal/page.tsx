"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { sedeName } from "@/lib/config";
import { BookOpen, Search, ChevronRight } from "lucide-react";

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

/* ─── Design tokens (from DESIGN.md) ─────────────────────────── */
const T = {
  navy:        "#181d26",
  blue:        "#1b61c9",
  weakText:    "rgba(4,14,32,0.55)",
  mutedText:   "rgba(4,14,32,0.45)",
  border:      "#e0e2e6",
  surface:     "#f8fafc",
  white:       "#ffffff",
  blueLight:   "#eff6ff",
  shadow:      "rgba(15,48,106,0.05) 0px 0px 20px",
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  COMPLETED:   { label: "Completado",  dot: "#15803d", bg: "#f0fdf4", text: "#15803d" },
  IN_PROGRESS: { label: "En progreso", dot: T.blue,    bg: T.blueLight, text: T.blue   },
};

/* ─── Main Page ───────────────────────────────────────────────── */
export default function PortalPage() {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Resolve user profile for group-assignment matching (B1 fix)
      const { data: profile } = await supabase
        .from("profiles")
        .select("sede_id, area")
        .eq("id", user.id)
        .single();

      // Build OR filter: ALL | INDIVIDUAL | SEDE | AREA
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

      // Deduplicate by training_id; derive status from certificates
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
        sedeName(a.training?.sede_id ?? null).toLowerCase().includes(q),
    );
  }, [assignments, search]);

  const completedCount = assignments.filter((a) => a.status === "COMPLETED").length;
  const totalCount     = assignments.length;
  const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1
            style={{ color: T.navy, letterSpacing: "0.12px" }}
            className="text-xl lg:text-2xl font-semibold"
          >
            Mis capacitaciones
          </h1>
          <p style={{ color: T.weakText, letterSpacing: "0.08px" }} className="text-sm mt-0.5">
            {completedCount} de {totalCount} completadas
          </p>
        </div>

        {totalCount > 0 && (
          <div
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
            className="self-start sm:self-auto flex items-center gap-3 px-4 py-2 rounded-xl"
          >
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: T.blue }}
              />
            </div>
            <span
              style={{ color: T.navy, letterSpacing: "0.07px" }}
              className="text-xs font-semibold tabular-nums"
            >
              {pct}%
            </span>
          </div>
        )}
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      {totalCount > 0 && (
        <div className="relative w-full sm:w-72">
          <Search
            style={{ color: T.mutedText }}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar capacitación…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: `1px solid ${T.border}`, color: T.navy, letterSpacing: "0.08px" }}
            className="w-full h-9 pl-9 pr-3 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1b61c9]/25 focus:border-[#1b61c9] transition-all"
          />
        </div>
      )}

      {/* ── Grid ────────────────────────────────────────────────── */}
      {loading ? (
        <GridSkeleton />
      ) : totalCount === 0 ? (
        <EmptyPortal />
      ) : (
        <div
          style={{ border: `1px solid ${T.border}`, boxShadow: T.shadow }}
          className="rounded-2xl overflow-hidden bg-white"
        >
          {/* Column headers */}
          <div
            style={{ borderBottom: `1px solid ${T.border}`, background: T.surface, letterSpacing: "0.28px" }}
            className="hidden sm:grid grid-cols-[1fr_148px_124px_120px_36px] px-4 py-2.5 text-[11px] font-semibold uppercase"
          >
            <span style={{ color: T.mutedText }}>Capacitación</span>
            <span style={{ color: T.mutedText }}>Estado</span>
            <span style={{ color: T.mutedText }}>Sede</span>
            <span style={{ color: T.mutedText }}>Vence</span>
            <span />
          </div>

          {/* Data rows */}
          <div className="divide-y divide-[#e0e2e6]">
            {filtered.length === 0 ? (
              <div
                style={{ color: T.mutedText, letterSpacing: "0.08px" }}
                className="px-4 py-10 text-center text-sm"
              >
                Sin resultados para &ldquo;{search}&rdquo;
              </div>
            ) : (
              filtered.map((row) => {
                const cfg       = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.IN_PROGRESS;
                const title     = row.training?.title ?? "Capacitación";
                const sName     = sedeName(row.training?.sede_id ?? null);
                const dueLabel  = row.due_date
                  ? new Date(row.due_date).toLocaleDateString("es-CL", {
                      day: "numeric", month: "short", year: "numeric",
                    })
                  : "—";

                return (
                  <Link
                    key={row.id}
                    href={`/portal/capacitacion/${row.training_id}`}
                    className="group flex sm:grid sm:grid-cols-[1fr_148px_124px_120px_36px] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1b61c9]/40"
                  >
                    {/* Title */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        style={{ background: T.blueLight }}
                        className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      >
                        <BookOpen style={{ color: T.blue }} className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p
                          style={{ color: T.navy, letterSpacing: "0.08px" }}
                          className="text-sm font-medium truncate group-hover:text-[#1b61c9] transition-colors"
                        >
                          {title}
                        </p>
                        {/* Mobile: inline status + sede */}
                        <div className="flex items-center gap-2 mt-1 sm:hidden">
                          <StatusBadge cfg={cfg} />
                          {sName && (
                            <span
                              style={{ color: T.mutedText, letterSpacing: "0.07px" }}
                              className="text-xs"
                            >
                              {sName}
                            </span>
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
                      <span
                        style={{ color: "rgba(4,14,32,0.69)", letterSpacing: "0.07px" }}
                        className="text-xs font-medium"
                      >
                        {sName || "—"}
                      </span>
                    </div>

                    {/* Due date — desktop */}
                    <div className="hidden sm:flex items-center">
                      <span
                        style={{ color: T.weakText, letterSpacing: "0.07px" }}
                        className="text-xs"
                      >
                        {dueLabel}
                      </span>
                    </div>

                    {/* Chevron */}
                    <div className="flex justify-end ml-auto sm:ml-0">
                      <ChevronRight
                        style={{ color: T.mutedText }}
                        className="h-4 w-4 group-hover:text-[#1b61c9] transition-colors shrink-0"
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
      style={{ background: cfg.bg, color: cfg.text, letterSpacing: "0.07px" }}
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
    <div
      style={{ border: `1px solid #e0e2e6` }}
      className="rounded-2xl overflow-hidden bg-white"
    >
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          style={{ borderBottom: i < 3 ? "1px solid #e0e2e6" : undefined }}
          className="flex items-center gap-4 px-4 py-3.5"
        >
          <div className="h-8 w-8 rounded-lg bg-[#eff6ff] animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-48 rounded-md bg-[#f0f0f0] animate-pulse" />
            <div className="h-2.5 w-20 rounded-md bg-[#f0f0f0] animate-pulse" />
          </div>
          <div className="hidden sm:block h-5 w-20 rounded-md bg-[#eff6ff] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyPortal() {
  return (
    <div
      style={{ border: "1px solid #e0e2e6", boxShadow: "rgba(15,48,106,0.05) 0px 0px 20px" }}
      className="rounded-2xl bg-white px-6 py-16 text-center"
    >
      <div
        style={{ background: "#eff6ff" }}
        className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
      >
        <BookOpen style={{ color: "#1b61c9" }} className="h-7 w-7" aria-hidden="true" />
      </div>
      <p
        style={{ color: "#181d26", letterSpacing: "0.12px" }}
        className="text-base font-semibold mb-1"
      >
        Sin capacitaciones asignadas
      </p>
      <p
        style={{ color: "rgba(4,14,32,0.55)", letterSpacing: "0.08px" }}
        className="text-sm max-w-xs mx-auto"
      >
        Aún no tienes capacitaciones asignadas. Contacta a tu administrador.
      </p>
    </div>
  );
}
