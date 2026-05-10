"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    return { bar: "#2d4a8a", chipBg: "#eaf0fb", chipText: "#2d4a8a", dotBg: "#2d4a8a", dateBox: "#2d4a8a" };
  if (sedeId === SEDES.COYHAIQUE.id)
    return { bar: "#f2b544", chipBg: "#fdf1d8", chipText: "#8a6410", dotBg: "#f2b544", dateBox: "#f2b544" };
  return   { bar: "#6b7185", chipBg: "#f0ece4", chipText: "#6b7185", dotBg: "#6b7185", dateBox: "#6b7185" };
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
  const router = useRouter();
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

    // Get user's assigned training IDs + profile sede
    const [{ data: assignments }, { data: profile }] = await Promise.all([
      supabase.from("assignments").select("training_id").eq("user_id", user.id),
      supabase.from("profiles").select("sede_id").eq("id", user.id).single(),
    ]);

    const trainingIds = (assignments ?? []).map((a) => a.training_id);

    if (trainingIds.length === 0) {
      setSessions([]);
      if (profile?.sede_id) setSelectedSede(profile.sede_id);
      setLoading(false);
      return;
    }

    const { data: sessionsData, error } = await supabase
      .from("sessions")
      .select("id, training_id, sede_id, start_date, end_date, modality, notes, trainings(title, sede_id)")
      .in("training_id", trainingIds)
      .order("start_date");

    if (error) {
      setLoadError("No se pudieron cargar las sesiones.");
      setLoading(false);
      return;
    }

    setSessions((sessionsData ?? []) as unknown as SessionRow[]);
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
      <div>
        <h1 className="text-[22px] font-[800] tracking-[-0.025em] text-[#15182b]">Mi calendario</h1>
        <p className="text-[13px] text-[#6b7185] mt-0.5">Sesiones de tus capacitaciones asignadas</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Sede filter */}
          <div className="flex rounded-lg bg-[#eaf0fb] p-1 mr-1">
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
                    ? "bg-[#f6f3ee] text-[#15182b] shadow-sm"
                    : "text-[#6b7185] hover:text-[#15182b]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={prevMonth}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#e8e4dc] bg-[#f6f3ee] text-[#6b7185] hover:bg-[#eaf0fb] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="w-48 text-center">
            <span className="text-base font-semibold text-[#15182b] tracking-tight">
              {MONTHS[month]}
            </span>
            <span className="ml-1.5 text-base font-light text-[#6b7185]">{year}</span>
          </div>

          <button
            onClick={nextMonth}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#e8e4dc] bg-[#f6f3ee] text-[#6b7185] hover:bg-[#eaf0fb] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {(year !== today.getFullYear() || month !== today.getMonth()) && (
            <button
              onClick={goToday}
              className="h-9 px-3 rounded-lg border border-[#e8e4dc] bg-[#f6f3ee] text-sm text-[#6b7185] hover:bg-[#eaf0fb] transition-colors"
            >
              Hoy
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-[#6b7185]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2d4a8a]" />
            Concepción
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Coyhaique
          </span>
        </div>
      </div>

      {loadError && (
        <div className="px-4 py-2.5 rounded-xl bg-[#ffe6e1] border border-[#ffccc5] text-[13px] text-[#e86154]">
          {loadError}
        </div>
      )}

      {/* Calendar grid */}
      <Card className="border-[#e8e4dc] shadow-sm overflow-hidden animate-fade-in">
        <CardContent className="p-0">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-[#e8e4dc]" style={{ background: "#f7f5f0" }}>
            {WEEK_DAYS.map((d) => (
              <div key={d} className="py-[14px] text-center text-[10.5px] font-[700] text-[#a5a9b8] uppercase tracking-[0.14em]">
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="py-20 text-center text-[13px] text-[#6b7185]">Cargando calendario...</div>
          ) : (
            <div className="grid grid-cols-7">
              {gridDays.map((day, idx) => {
                const dateStr = toDateStr(day);
                const inMonth = day.getMonth() === month;
                const isToday = dateStr === todayStr;
                const daySessions = sessionsForDay(dateStr, visibleSessions).filter((s) => s.start_date === dateStr);
                const isLastRow = idx >= 35;
                const isLastCol = (idx + 1) % 7 === 0;

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "min-h-[108px] p-2.5",
                      "border-b border-r border-[#f0ece4]",
                      isLastRow && "border-b-0",
                      isLastCol && "border-r-0",
                    )}
                    style={!inMonth ? { background: "#f7f5f0" } : { background: "white" }}
                  >
                    {/* Day number */}
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className="text-[12px] font-[700]"
                        style={
                          isToday
                            ? { background: "#ff7c6b", color: "white", borderRadius: "50%", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center" }
                            : { color: inMonth ? "#15182b" : "#a5a9b8" }
                        }
                      >
                        {day.getDate()}
                      </span>
                      {daySessions.length > 2 && (
                        <span className="text-[10px] text-[#a5a9b8]">+{daySessions.length - 2}</span>
                      )}
                    </div>

                    {/* Event chips */}
                    <div className="space-y-[5px]">
                      {daySessions.slice(0, 2).map((s) => {
                        const st = sedeStyle(s.sede_id);
                        const title = sessionTitle(s);
                        return (
                          <div
                            key={s.id}
                            onClick={() => router.push(`/portal/capacitacion/${s.training_id}`)}
                            title={title}
                            className="flex items-center gap-[5px] px-[7px] py-[3px] rounded-[6px] text-[10.5px] font-[600] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ background: st.chipBg, color: st.chipText }}
                          >
                            <span
                              className="w-[3px] h-[10px] rounded-[2px] flex-shrink-0"
                              style={{ background: st.bar }}
                            />
                            <span className="truncate">{title}</span>
                          </div>
                        );
                      })}
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
        <Card className="border-[#e8e4dc] shadow-sm animate-fade-in">
          <CardContent className="p-4 lg:p-5">
            <h3 className="text-[13px] font-[700] text-[#15182b] uppercase tracking-[0.05em] mb-3">
              Sesiones del mes
              <span className="ml-2 text-[11px] font-[500] text-[#a5a9b8] normal-case tracking-normal">
                {visibleSessions.length} en {MONTHS[month]}
              </span>
            </h3>
            <div className="space-y-2">
              {visibleSessions.map((s) => {
                const st = sedeStyle(s.sede_id);
                const title = sessionTitle(s);
                const startDate = parseLocalDate(s.start_date);
                const dayAbbr = startDate.toLocaleDateString("es-CL", { weekday: "short" }).toUpperCase().replace(".", "").slice(0, 3);
                const dayNum  = startDate.getDate();

                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-[10px] rounded-[12px] border border-[#e8e4dc] bg-[#f7f5f0]"
                  >
                    {/* Date box */}
                    <div
                      className="w-11 h-11 rounded-[12px] flex flex-col items-center justify-center shrink-0"
                      style={{
                        background: st.dateBox,
                        color: st.dateBox === "#f2b544" ? "#4a3410" : "white",
                      }}
                    >
                      <span className="text-[9px] font-[700] uppercase tracking-[0.1em] leading-none">{dayAbbr}</span>
                      <span className="text-[17px] font-[800] leading-tight tabular-nums">{dayNum}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-[600] text-[#15182b] truncate leading-snug">{title}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="text-[11.5px] text-[#6b7185]">{formatDateRange(s.start_date, s.end_date)}</span>
                        {s.sede_id && (
                          <>
                            <span className="text-[#e8e4dc]">·</span>
                            <span
                              className="inline-flex items-center gap-1 text-[11.5px] font-[600]"
                              style={{ color: st.chipText }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.bar }} />
                              {sedeName(s.sede_id)}
                            </span>
                          </>
                        )}
                        <span className="text-[#e8e4dc]">·</span>
                        <span className="text-[11.5px] text-[#6b7185]">
                          {s.modality === "PRESENCIAL" ? "Presencial" : "Online"}
                        </span>
                      </div>
                      {s.notes && (
                        <p className="text-[11px] text-[#a5a9b8] italic truncate mt-0.5">{s.notes}</p>
                      )}
                    </div>

                    <button
                      onClick={() => router.push(`/portal/capacitacion/${s.training_id}`)}
                      className="h-7 px-2.5 rounded-[8px] text-[12px] font-[600] text-[#2d4a8a] hover:bg-[#eaf0fb] transition-colors border border-[#e8e4dc] bg-white shrink-0"
                    >
                      Ver
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && visibleSessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="h-12 w-12 rounded-2xl bg-[#eaf0fb] flex items-center justify-center mb-3">
            <Calendar className="h-6 w-6 text-[#a5a9b8]" />
          </div>
          <p className="text-sm font-medium text-[#15182b]">Sin sesiones en {MONTHS[month]}</p>
          <p className="text-xs text-[#6b7185] mt-1">No hay capacitaciones programadas para este mes.</p>
        </div>
      )}
    </div>
  );
}
