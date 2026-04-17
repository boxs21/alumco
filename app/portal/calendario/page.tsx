"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { SEDES, sedeName } from "@/lib/config";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionRow {
  id: string;
  training_id: string;
  sede_id: string | null;
  start_date: string;
  end_date: string;
  modality: "PRESENCIAL" | "ONLINE";
  notes: string | null;
  trainings: { title: string; sede_id: string | null } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalDate(str: string): Date {
  return new Date(str + "T00:00:00");
}

function buildCalendarGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const days: Date[] = [];
  for (let i = -offset; i < 42 - offset; i++) {
    days.push(new Date(year, month, 1 + i));
  }
  return days;
}

function sessionsForDay(dateStr: string, sessions: SessionRow[]): SessionRow[] {
  return sessions.filter((s) => s.start_date <= dateStr && s.end_date >= dateStr);
}

function sedeStyle(sedeId: string | null) {
  if (sedeId === SEDES.CONCEPCION.id)
    return {
      bar: "bg-[#2d4a2b]",
      pill: "bg-[#2d4a2b]/[0.09] text-[#1a3319] border-[#2d4a2b]/25",
      dot: "bg-[#2d4a2b]",
    };
  if (sedeId === SEDES.COYHAIQUE.id)
    return {
      bar: "bg-amber-500",
      pill: "bg-amber-500/[0.10] text-amber-900 border-amber-400/30",
      dot: "bg-amber-500",
    };
  return {
    bar: "bg-[#7d8471]",
    pill: "bg-[#7d8471]/[0.08] text-[#4a5540] border-[#7d8471]/20",
    dot: "bg-[#7d8471]",
  };
}

function formatDateRange(start: string, end: string): string {
  const s = parseLocalDate(start).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  const e = parseLocalDate(end).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  return s === e ? s : `${s} → ${e}`;
}

function sessionTitle(s: SessionRow): string {
  if (!s.trainings) return "—";
  const t = s.trainings;
  return Array.isArray(t) ? (t[0]?.title ?? "—") : (t.title ?? "—");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortalCalendarioPage() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedSede, setSelectedSede] = useState("global");

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: sessionsData, error }, { data: profile }] = await Promise.all([
      supabase
        .from("sessions")
        .select("id, training_id, sede_id, start_date, end_date, modality, notes, trainings(title, sede_id)")
        .order("start_date"),
      supabase.from("profiles").select("sede_id").eq("id", user.id).single(),
    ]);

    if (error) {
      setLoadError("No se pudieron cargar las sesiones.");
      setLoading(false);
      return;
    }

    setSessions((sessionsData ?? []) as unknown as SessionRow[]);

    // Pre-seleccionar la sede del colaborador
    if (profile?.sede_id) setSelectedSede(profile.sede_id);

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    new Date(year, month + 1, 0).getDate()
  ).padStart(2, "0")}`;

  const visibleSessions = sessions.filter((s) => {
    if (selectedSede !== "global" && s.sede_id !== selectedSede) return false;
    return s.start_date <= monthEnd && s.end_date >= monthStart;
  });

  const gridDays = buildCalendarGrid(year, month);
  const todayStr = toDateStr(today);

  return (
    <div className="space-y-4 lg:space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Sede filter */}
          <div className="flex rounded-lg bg-[#f0f2eb] p-1 mr-1">
            {[
              { key: "global",            label: "Todas" },
              { key: SEDES.CONCEPCION.id, label: SEDES.CONCEPCION.nombre },
              { key: SEDES.COYHAIQUE.id,  label: SEDES.COYHAIQUE.nombre },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedSede(tab.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedSede === tab.key
                    ? "bg-[#faf9f6] text-[#1e2d1c] shadow-sm"
                    : "text-[#7d8471] hover:text-[#1e2d1c]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Month navigation */}
          <button
            onClick={prevMonth}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-[#7d8471] hover:bg-[#f0f2eb] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="w-44 text-center">
            <span className="text-base font-semibold text-[#1e2d1c] tracking-tight">
              {MONTHS[month]}
            </span>
            <span className="ml-1.5 text-base font-light text-[#7d8471]">{year}</span>
          </div>

          <button
            onClick={nextMonth}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-[#7d8471] hover:bg-[#f0f2eb] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {(year !== today.getFullYear() || month !== today.getMonth()) && (
            <button
              onClick={goToday}
              className="h-9 px-3 rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-sm text-[#7d8471] hover:bg-[#f0f2eb] transition-colors"
            >
              Hoy
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-[#7d8471]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2d4a2b]" />
            Concepción
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Coyhaique
          </span>
        </div>
      </div>

      {loadError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Calendar grid */}
      <Card className="border-[#dde0d4] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Week day headers */}
          <div className="grid grid-cols-7 bg-[#f0f2eb] border-b border-[#dde0d4]">
            {WEEK_DAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-semibold text-[#7d8471] uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-[#7d8471]">
              Cargando calendario...
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {gridDays.map((day, idx) => {
                const dateStr = toDateStr(day);
                const inMonth = day.getMonth() === month;
                const isToday = dateStr === todayStr;
                const daySessions = sessionsForDay(dateStr, visibleSessions);
                const isLastRow = idx >= 35;
                const isLastCol = (idx + 1) % 7 === 0;

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "min-h-[76px] lg:min-h-[96px] p-1 lg:p-1.5",
                      "border-b border-r border-[#dde0d4]",
                      isLastRow && "border-b-0",
                      isLastCol && "border-r-0",
                      inMonth ? "bg-[#faf9f6]" : "bg-[#faf9f6]/50",
                    )}
                  >
                    <div className="flex items-start justify-between mb-0.5">
                      <div className="flex items-center gap-0.5 pt-0.5 pl-0.5">
                        {daySessions.length > 0 && daySessions.slice(0, 3).map((s) => {
                          const st = sedeStyle(s.sede_id);
                          return (
                            <span
                              key={s.id}
                              className={cn("h-1 w-1 rounded-full flex-shrink-0", st.dot)}
                            />
                          );
                        })}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full",
                          isToday && "bg-[#2d4a2b] text-white",
                          !isToday && inMonth && "text-[#1e2d1c]",
                          !isToday && !inMonth && "text-[#a4ac86]",
                        )}
                      >
                        {day.getDate()}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {daySessions.slice(0, 2).map((s) => {
                        const style = sedeStyle(s.sede_id);
                        const isStart = s.start_date === dateStr;
                        const isEnd = s.end_date === dateStr;
                        const title = sessionTitle(s);

                        return (
                          <div
                            key={s.id}
                            title={title}
                            className={cn(
                              "relative h-5 text-[10px] font-semibold leading-5 truncate border select-none",
                              style.pill,
                              isStart && isEnd && "rounded-full px-1.5",
                              isStart && !isEnd && "rounded-l-full pl-1.5 rounded-r-none border-r-0 pr-0",
                              !isStart && isEnd && "rounded-r-full pr-1 rounded-l-none border-l-0 pl-0",
                              !isStart && !isEnd && "rounded-none border-x-0 px-0",
                            )}
                          >
                            {isStart && (
                              <span className="hidden lg:flex items-center gap-0.5 pl-0.5">
                                <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0 -mt-px", style.dot)} />
                                <span className="truncate">{title}</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {daySessions.length > 2 && (
                        <p className="text-[10px] font-medium text-[#7d8471] pl-1">
                          +{daySessions.length - 2} más
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session list */}
      {!loading && visibleSessions.length > 0 && (
        <Card className="border-[#dde0d4] shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-baseline gap-2 mb-4">
              <h3 className="text-sm font-semibold text-[#1e2d1c] tracking-tight">
                {MONTHS[month]} {year}
              </h3>
              <span className="text-xs text-[#a4ac86]">
                {visibleSessions.length} sesión{visibleSessions.length !== 1 ? "es" : ""}
              </span>
            </div>
            <div className="space-y-2">
              {visibleSessions.map((s) => {
                const style = sedeStyle(s.sede_id);
                const title = sessionTitle(s);

                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#dde0d4] bg-[#faf9f6]"
                  >
                    <div className={cn("w-[3px] self-stretch rounded-full flex-shrink-0", style.bar)} />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1e2d1c] truncate leading-snug">
                        {title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <p className="text-xs text-[#7d8471]">
                          {formatDateRange(s.start_date, s.end_date)}
                        </p>
                        {s.sede_id && (
                          <>
                            <span className="text-[#dde0d4]">·</span>
                            <span className="flex items-center gap-1 text-xs text-[#7d8471]">
                              <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", style.dot)} />
                              {sedeName(s.sede_id)}
                            </span>
                          </>
                        )}
                        <span className="text-[#dde0d4]">·</span>
                        <span className="text-xs text-[#7d8471]">
                          {s.modality === "PRESENCIAL" ? "Presencial" : "Online"}
                        </span>
                      </div>
                      {s.notes && (
                        <p className="text-xs text-[#a4ac86] mt-0.5 italic truncate">{s.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && visibleSessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-2xl bg-[#f0f2eb] flex items-center justify-center mb-3">
            <Calendar className="h-6 w-6 text-[#a4ac86]" />
          </div>
          <p className="text-sm font-medium text-[#1e2d1c]">
            Sin sesiones en {MONTHS[month]}
          </p>
          <p className="text-xs text-[#7d8471] mt-1">
            No hay capacitaciones programadas para este mes.
          </p>
        </div>
      )}
    </div>
  );
}
