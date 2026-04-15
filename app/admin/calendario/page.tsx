"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertCircle,
  X,
  Calendar,
} from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Training {
  id: string;
  title: string;
  sede_id: string | null;
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

/** Returns 42 days (6 rows × 7 cols) starting from Monday before month start */
function buildCalendarGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  // Monday-first offset: Sun=0 → 6, Mon=1 → 0, Tue=2 → 1, …
  const offset = (firstDay.getDay() + 6) % 7;
  const days: Date[] = [];
  for (let i = -offset; i < 42 - offset; i++) {
    days.push(new Date(year, month, 1 + i));
  }
  return days;
}

function sessionsForDay(dateStr: string, sessions: SessionRow[]): SessionRow[] {
  return sessions.filter(
    (s) => s.start_date <= dateStr && s.end_date >= dateStr
  );
}

function computeConflictIds(sessions: SessionRow[]): Set<string> {
  const ids = new Set<string>();
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const a = sessions[i];
      const b = sessions[j];
      if (!a.sede_id || !b.sede_id || a.sede_id !== b.sede_id) continue;
      if (a.start_date <= b.end_date && a.end_date >= b.start_date) {
        ids.add(a.id);
        ids.add(b.id);
      }
    }
  }
  return ids;
}

function sedeStyle(sedeId: string | null) {
  if (sedeId === SEDES.CONCEPCION.id)
    return { bar: "bg-[#2d4a2b]", pill: "bg-[#f0f2eb] text-[#2d4a2b] border-[#a4ac86]/40" };
  if (sedeId === SEDES.COYHAIQUE.id)
    return { bar: "bg-amber-500", pill: "bg-amber-50 text-amber-700 border-amber-200" };
  return { bar: "bg-[#7d8471]", pill: "bg-[#f0f2eb] text-[#7d8471] border-[#dde0d4]" };
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

export default function CalendarioPage() {
  const router = useRouter();
  const today = new Date();

  const [selectedSede, setSelectedSede] = useState("global");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [allTrainings, setAllTrainings] = useState<Training[]>([]);
  const [conflictIds, setConflictIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // ── New session form ──
  const [showModal, setShowModal] = useState(false);
  const [formTrainingId, setFormTrainingId] = useState("");
  const [formSedeId, setFormSedeId] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewConflicts, setPreviewConflicts] = useState<SessionRow[]>([]);

  // ─── Load data ───────────────────────────────────────────────────────────────

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const supabase = createClient();
    const [{ data: sessionsData, error: e1 }, { data: trainingsData, error: e2 }] = await Promise.all([
      supabase
        .from("sessions")
        .select(
          "id, training_id, sede_id, start_date, end_date, modality, notes, trainings(title, sede_id)"
        )
        .order("start_date"),
      supabase
        .from("trainings")
        .select("id, title, sede_id")
        .neq("status", "ARCHIVED")
        .order("title"),
    ]);
    if (e1 ?? e2) {
      console.error("[calendario] load error:", (e1 ?? e2)?.message);
      setLoadError("No se pudieron cargar los datos del calendario.");
      setLoading(false);
      return;
    }
    const s = (sessionsData ?? []) as unknown as SessionRow[];
    setSessions(s);
    setAllTrainings(trainingsData ?? []);
    setConflictIds(computeConflictIds(s));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Navigation ──────────────────────────────────────────────────────────────

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

  // ─── Filtered sessions for current view ──────────────────────────────────────

  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    new Date(year, month + 1, 0).getDate()
  ).padStart(2, "0")}`;

  const visibleSessions = sessions.filter((s) => {
    if (selectedSede !== "global" && s.sede_id !== selectedSede) return false;
    return s.start_date <= monthEnd && s.end_date >= monthStart;
  });

  // ─── Conflict preview while filling the form ─────────────────────────────────

  useEffect(() => {
    if (!formSedeId || !formStart || !formEnd || formEnd < formStart) {
      setPreviewConflicts([]);
      return;
    }
    const sedeIds =
      formSedeId === "AMBAS"
        ? [SEDES.CONCEPCION.id, SEDES.COYHAIQUE.id]
        : [formSedeId];
    setPreviewConflicts(
      sessions.filter(
        (s) =>
          s.sede_id !== null &&
          sedeIds.includes(s.sede_id) &&
          s.start_date <= formEnd &&
          s.end_date >= formStart
      )
    );
  }, [formSedeId, formStart, formEnd, sessions]);

  // Auto-fill sede from training
  useEffect(() => {
    if (!formTrainingId) return;
    const t = allTrainings.find((t) => t.id === formTrainingId);
    if (t?.sede_id) setFormSedeId(t.sede_id);
  }, [formTrainingId, allTrainings]);

  // ─── Open modal ──────────────────────────────────────────────────────────────

  function openModal(prefillDate?: string) {
    resetForm();
    if (prefillDate) {
      setFormStart(prefillDate);
      setFormEnd(prefillDate);
    }
    setShowModal(true);
  }

  function resetForm() {
    setFormTrainingId("");
    setFormSedeId("");
    setFormStart("");
    setFormEnd("");
    setFormNotes("");
    setFormError(null);
    setPreviewConflicts([]);
  }

  // ─── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!formTrainingId || !formStart || !formEnd) {
      setFormError("Selecciona capacitación, fecha inicio y fecha fin.");
      return;
    }
    if (formEnd < formStart) {
      setFormError("La fecha fin no puede ser anterior a la fecha inicio.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const supabase = createClient();
    const rows =
      formSedeId === "AMBAS"
        ? [SEDES.CONCEPCION.id, SEDES.COYHAIQUE.id].map((sede_id) => ({
            id: crypto.randomUUID(),
            training_id: formTrainingId,
            sede_id,
            start_date: formStart,
            end_date: formEnd,
            modality: "PRESENCIAL" as const,
            notes: formNotes.trim() || null,
          }))
        : [
            {
              id: crypto.randomUUID(),
              training_id: formTrainingId,
              sede_id: formSedeId || null,
              start_date: formStart,
              end_date: formEnd,
              modality: "PRESENCIAL" as const,
              notes: formNotes.trim() || null,
            },
          ];
    const { error } = await supabase.from("sessions").insert(rows);
    if (error) {
      setFormError(error.message);
      setSaving(false);
      return;
    }
    setShowModal(false);
    resetForm();
    loadData();
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) {
      console.error("[calendario] delete session error:", error.message);
      return;
    }
    loadData();
  }

  // ─── Calendar grid ───────────────────────────────────────────────────────────

  const gridDays = buildCalendarGrid(year, month);
  const todayStr = toDateStr(today);

  // How many conflicts are visible (considering sede filter)
  const visibleConflictCount = visibleSessions.filter((s) =>
    conflictIds.has(s.id)
  ).length;

  return (
    <div>
      <Topbar
        selectedSede={selectedSede}
        onSedeChange={setSelectedSede}
        title="Calendario"
      />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-5">
        {/* ── Top controls ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-[#7d8471] hover:bg-[#f0f2eb] transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="w-48 text-center">
              <span className="text-base font-semibold text-[#1e2d1c]">
                {MONTHS[month]}
              </span>
              <span className="ml-2 text-base font-semibold text-[#2d4a2b]">
                {year}
              </span>
            </div>

            <button
              onClick={nextMonth}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#dde0d4] bg-[#faf9f6] text-[#7d8471] hover:bg-[#f0f2eb] transition-colors"
              aria-label="Mes siguiente"
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

          {/* Right side: legend + new session button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 text-xs text-[#7d8471]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#f0f2eb] border border-[#a4ac86]/40" />
                Concepción
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-50 border border-amber-200" />
                Coyhaique
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Conflicto
              </span>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva sesión</span>
            </button>
          </div>
        </div>

        {/* ── Load error banner ── */}
        {loadError && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {loadError}
          </div>
        )}

        {/* ── Conflict banner ── */}
        {visibleConflictCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              {visibleConflictCount} sesión
              {visibleConflictCount !== 1 ? "es" : ""} con conflicto de fechas
              en la misma sede.
            </span>
          </div>
        )}

        {/* ── Calendar grid ── */}
        <Card className="border-[#dde0d4] shadow-sm overflow-hidden animate-fade-in">
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
                      onClick={() => inMonth && openModal(dateStr)}
                      className={cn(
                        "min-h-[76px] lg:min-h-[96px] p-1 lg:p-1.5",
                        "border-b border-r border-[#dde0d4]",
                        !isLastRow && "border-b",
                        isLastRow && "border-b-0",
                        isLastCol && "border-r-0",
                        inMonth
                          ? "bg-[#faf9f6] cursor-pointer hover:bg-[#f0f2eb]/50 transition-colors"
                          : "bg-[#faf9f6]/50 cursor-default",
                      )}
                    >
                      {/* Day number */}
                      <div className="flex justify-end mb-0.5">
                        <span
                          className={cn(
                            "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full",
                            isToday &&
                              "bg-[#2d4a2b] text-white",
                            !isToday &&
                              inMonth &&
                              "text-[#1e2d1c]",
                            !isToday &&
                              !inMonth &&
                              "text-[#a4ac86]",
                          )}
                        >
                          {day.getDate()}
                        </span>
                      </div>

                      {/* Events */}
                      <div className="space-y-0.5">
                        {daySessions.slice(0, 2).map((s) => {
                          const style = sedeStyle(s.sede_id);
                          const hasConflict = conflictIds.has(s.id);
                          const isStart = s.start_date === dateStr;
                          const isEnd = s.end_date === dateStr;
                          const title = sessionTitle(s);

                          return (
                            <div
                              key={s.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/admin/capacitaciones/${s.training_id}`
                                );
                              }}
                              title={title}
                              className={cn(
                                "relative h-5 text-[10px] font-medium leading-5 truncate border cursor-pointer transition-opacity hover:opacity-75",
                                style.pill,
                                isStart && isEnd && "rounded-full px-1.5",
                                isStart && !isEnd && "rounded-l-full pl-1.5 rounded-r-none pr-0",
                                !isStart && isEnd && "rounded-r-full pr-1 rounded-l-none pl-0",
                                !isStart && !isEnd && "rounded-none px-0",
                                hasConflict && "ring-1 ring-red-400 ring-inset",
                              )}
                            >
                              {hasConflict && (
                                <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              )}
                              {isStart && (
                                <span className="hidden lg:inline">{title}</span>
                              )}
                            </div>
                          );
                        })}
                        {daySessions.length > 2 && (
                          <p className="text-[10px] text-[#7d8471] pl-1">
                            +{daySessions.length - 2}
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

        {/* ── Session list for current month ── */}
        {!loading && visibleSessions.length > 0 && (
          <Card className="border-[#dde0d4] shadow-sm animate-fade-in">
            <CardContent className="p-4 lg:p-5">
              <h3 className="text-sm font-semibold text-[#1e2d1c] mb-3">
                {MONTHS[month]} {year} · {visibleSessions.length} sesión
                {visibleSessions.length !== 1 ? "es" : ""}
              </h3>
              <div className="space-y-2">
                {visibleSessions.map((s) => {
                  const style = sedeStyle(s.sede_id);
                  const hasConflict = conflictIds.has(s.id);
                  const title = sessionTitle(s);

                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border",
                        style.pill,
                        hasConflict && "ring-1 ring-red-300",
                      )}
                    >
                      <div
                        className={cn("w-1 self-stretch rounded-full flex-shrink-0", style.bar)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-medium text-[#1e2d1c] truncate">
                            {title}
                          </p>
                          {hasConflict && (
                            <Badge className="bg-red-100 text-red-600 border-red-200 text-[10px] shrink-0">
                              Conflicto
                            </Badge>
                          )}
                          <Badge
                            className={cn(
                              "text-[10px] shrink-0",
                              style.pill
                            )}
                          >
                            {s.modality === "PRESENCIAL" ? "Presencial" : "Online"}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#7d8471] mt-0.5">
                          {formatDateRange(s.start_date, s.end_date)}
                          {s.sede_id && ` · ${sedeName(s.sede_id)}`}
                        </p>
                        {s.notes && (
                          <p className="text-xs text-[#7d8471] mt-0.5 italic">
                            {s.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/capacitaciones/${s.training_id}`
                            )
                          }
                          className="h-8 px-2.5 rounded-lg text-xs text-[#2d4a2b] hover:bg-[#f0f2eb] transition-colors font-medium"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-[#a4ac86] hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Eliminar sesión"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && visibleSessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="h-12 w-12 rounded-2xl bg-[#f0f2eb] flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-[#a4ac86]" />
            </div>
            <p className="text-sm font-medium text-[#1e2d1c]">
              Sin sesiones en {MONTHS[month]}
            </p>
            <p className="text-xs text-[#7d8471] mt-1">
              Haz clic en un día o en &quot;Nueva sesión&quot; para agregar una.
            </p>
          </div>
        )}
      </div>

      {/* ── New Session Modal ── */}
      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          if (!open) { setShowModal(false); resetForm(); }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl border-[#dde0d4]">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d1c]">
              Nueva sesión presencial
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Training */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e2d1c]">
                Capacitación
              </Label>
              <Select
                value={formTrainingId}
                onValueChange={(v) => {
                  setFormTrainingId(v);
                  if (formError) setFormError(null);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl border-[#dde0d4]">
                  <SelectValue placeholder="Selecciona una capacitación" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-60">
                  {allTrainings.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sede */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e2d1c]">Sede</Label>
              <Select value={formSedeId} onValueChange={setFormSedeId}>
                <SelectTrigger className="h-10 rounded-xl border-[#dde0d4]">
                  <SelectValue placeholder="Selecciona sede" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={SEDES.CONCEPCION.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2d4a2b]" />
                      Concepción
                    </span>
                  </SelectItem>
                  <SelectItem value={SEDES.COYHAIQUE.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Coyhaique
                    </span>
                  </SelectItem>
                  <SelectItem value="AMBAS">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#7d8471]" />
                      Ambas sedes
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e2d1c]">
                  Fecha inicio
                </Label>
                <Input
                  type="date"
                  value={formStart}
                  onChange={(e) => {
                    setFormStart(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="h-10 rounded-xl border-[#dde0d4]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e2d1c]">
                  Fecha fin
                </Label>
                <Input
                  type="date"
                  value={formEnd}
                  min={formStart}
                  onChange={(e) => {
                    setFormEnd(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="h-10 rounded-xl border-[#dde0d4]"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e2d1c]">
                Notas{" "}
                <span className="font-normal text-[#7d8471]">(opcional)</span>
              </Label>
              <Input
                placeholder="Sala, instructor, requisitos..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="h-10 rounded-xl border-[#dde0d4]"
              />
            </div>

            {/* Conflict preview */}
            {previewConflicts.length > 0 && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-medium text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  Conflicto con {previewConflicts.length} sesión
                  {previewConflicts.length !== 1 ? "es" : ""} en la misma sede
                </div>
                <div className="space-y-1">
                  {previewConflicts.map((s) => (
                    <p key={s.id} className="text-xs text-red-600 pl-5">
                      · {sessionTitle(s)} ({formatDateRange(s.start_date, s.end_date)})
                    </p>
                  ))}
                </div>
              </div>
            )}

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 h-10 rounded-xl border border-[#dde0d4] bg-[#faf9f6] text-sm text-[#7d8471] hover:bg-[#f0f2eb] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-10 rounded-xl bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] disabled:opacity-50 transition-colors"
              >
                {saving ? "Guardando..." : "Guardar sesión"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
