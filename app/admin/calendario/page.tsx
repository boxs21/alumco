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
    return { bar: "#2d4a8a", chipBg: "#eaf0fb", chipText: "#2d4a8a",  dotBg: "#2d4a8a",  dateBox: "#2d4a8a" };
  if (sedeId === SEDES.COYHAIQUE.id)
    return { bar: "#f2b544",  chipBg: "#fdf1d8", chipText: "#8a6410",  dotBg: "#f2b544",  dateBox: "#f2b544" };
  return   { bar: "#6b7185",  chipBg: "#f0ece4", chipText: "#6b7185",  dotBg: "#6b7185",  dateBox: "#6b7185" };
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

  const visibleConflictCount = visibleSessions.filter((s) =>
    conflictIds.has(s.id)
  ).length;

  return (
    <div>
      <Topbar
        title="Calendario"
        sub="Sesiones y eventos programados"
        right={
          <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[13px] font-[600] transition-colors">
            <span className="text-base leading-none">+</span> Nueva sesión
          </button>
        }
      />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
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
              <span className="ml-1.5 text-base font-light text-[#6b7185]">
                {year}
              </span>
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

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 text-xs text-[#6b7185]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#2d4a8a]" />
                Concepción
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Coyhaique
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Conflicto
              </span>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#2d4a8a] text-white text-sm font-medium hover:bg-[#15182b] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva sesión</span>
            </button>
          </div>
        </div>

        {loadError && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl rounded-xl bg-[#ffe6e1] border border-[#ffccc5] text-[13px] text-[#e86154]">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {loadError}
          </div>
        )}

        {visibleConflictCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl rounded-xl bg-[#ffe6e1] border border-[#ffccc5] text-[13px] text-[#e86154] animate-fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              {visibleConflictCount} sesión
              {visibleConflictCount !== 1 ? "es" : ""} con conflicto de fechas
              en la misma sede.
            </span>
          </div>
        )}

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
                      onClick={() => inMonth && openModal(dateStr)}
                      className={cn(
                        "min-h-[108px] p-2.5",
                        "border-b border-r border-[#f0ece4]",
                        isLastRow && "border-b-0",
                        isLastCol && "border-r-0",
                        inMonth ? "bg-white cursor-pointer hover:bg-[#eaf0fb]/30 transition-colors" : "cursor-default",
                      )}
                      style={!inMonth ? { background: "#f7f5f0" } : undefined}
                    >
                      {/* Day number */}
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[12px] font-[700]"
                          style={isToday
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
                          const hasConflict = conflictIds.has(s.id);
                          const title = sessionTitle(s);
                          return (
                            <div
                              key={s.id}
                              onClick={(e) => { e.stopPropagation(); router.push(`/admin/capacitaciones/${s.training_id}`); }}
                              title={title}
                              className="flex items-center gap-[5px] px-[7px] py-[3px] rounded-[6px] text-[10.5px] font-[600] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ background: hasConflict ? "#fee2e2" : st.chipBg, color: hasConflict ? "#dc2626" : st.chipText }}
                            >
                              <span className="w-[3px] h-[10px] rounded-[2px] flex-shrink-0"
                                style={{ background: hasConflict ? "#dc2626" : st.bar }} />
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

        {!loading && visibleSessions.length > 0 && (
          <Card className="border-[#e8e4dc] shadow-sm animate-fade-in">
            <CardContent className="p-4 lg:p-5">
              <h3 className="text-[13px] font-[700] text-[#15182b] uppercase tracking-[0.05em] mb-3">
                Próximas sesiones
                <span className="ml-2 text-[11px] font-[500] text-[#a5a9b8] normal-case tracking-normal">
                  {visibleSessions.length} en {MONTHS[month]}
                </span>
              </h3>
              <div className="space-y-2">
                {visibleSessions.map((s) => {
                  const st = sedeStyle(s.sede_id);
                  const hasConflict = conflictIds.has(s.id);
                  const title = sessionTitle(s);
                  const startDate = parseLocalDate(s.start_date);
                  const dayAbbr = startDate.toLocaleDateString("es-CL", { weekday: "short" }).toUpperCase().replace(".", "").slice(0, 3);
                  const dayNum  = startDate.getDate();

                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-[10px] rounded-[12px] border",
                        hasConflict ? "border-red-200 bg-red-50" : "border-[#e8e4dc] bg-[#f7f5f0]",
                      )}
                    >
                      {/* Colored date box */}
                      <div
                        className="w-11 h-11 rounded-[12px] flex flex-col items-center justify-center shrink-0"
                        style={{ background: hasConflict ? "#dc2626" : st.dateBox, color: (st.dateBox === "#f2b544") ? "#4a3410" : "white" }}
                      >
                        <span className="text-[9px] font-[700] uppercase tracking-[0.1em] leading-none">{dayAbbr}</span>
                        <span className="text-[17px] font-[800] leading-tight tabular-nums">{dayNum}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <p className="text-[13.5px] font-[600] text-[#15182b] truncate leading-snug">{title}</p>
                          {hasConflict && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-[700] bg-red-100 text-red-600">Conflicto</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11.5px] text-[#6b7185]">{s.modality === "PRESENCIAL" ? "Presencial" : "Online"}</span>
                          {s.sede_id && (
                            <>
                              <span className="text-[#e8e4dc]">·</span>
                              <span className="inline-flex items-center gap-1 text-[11.5px] font-[600]"
                                style={{ color: st.chipText }}>
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.bar }} />
                                {sedeName(s.sede_id)}
                              </span>
                            </>
                          )}
                          {s.notes && (
                            <><span className="text-[#e8e4dc]">·</span>
                            <span className="text-[11.5px] text-[#a5a9b8] italic truncate">{s.notes}</span></>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => router.push(`/admin/capacitaciones/${s.training_id}`)}
                          className="h-7 px-2.5 rounded-[8px] text-[12px] font-[600] text-[#2d4a8a] hover:bg-[#eaf0fb] transition-colors border border-[#e8e4dc] bg-white"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-[8px] text-[#a5a9b8] hover:text-red-500 hover:bg-red-50 transition-colors"
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

        {!loading && visibleSessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="h-12 w-12 rounded-2xl bg-[#eaf0fb] flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-[#a5a9b8]" />
            </div>
            <p className="text-sm font-medium text-[#15182b]">
              Sin sesiones en {MONTHS[month]}
            </p>
            <p className="text-xs text-[#6b7185] mt-1">
              Haz clic en un día o en &quot;Nueva sesión&quot; para agregar una.
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          if (!open) { setShowModal(false); resetForm(); }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl border-[#e8e4dc]">
          <DialogHeader>
            <DialogTitle className="text-[#15182b]">
              Nueva sesión
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#15182b]">
                Capacitación
              </Label>
              <Select
                value={formTrainingId}
                onValueChange={(v) => {
                  setFormTrainingId(v);
                  if (formError) setFormError(null);
                }}
              >
                {/* LA LÍNEA MÁGICA DE CSS ESTÁ JUSTO AQUÍ ABAJO 👇 */}
                <SelectTrigger className="h-10 w-full max-w-full overflow-hidden rounded-xl border-[#e8e4dc] [&>span]:truncate [&>span]:text-left">
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

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#15182b]">Sede</Label>
              <Select value={formSedeId} onValueChange={setFormSedeId}>
                <SelectTrigger className="h-10 rounded-xl border-[#e8e4dc]">
                  <SelectValue placeholder="Selecciona sede" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={SEDES.CONCEPCION.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2d4a8a]" />
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
                      <span className="h-2 w-2 rounded-full bg-[#6b7185]" />
                      Ambas sedes
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#15182b]">
                  Fecha inicio
                </Label>
                <Input
                  type="date"
                  value={formStart}
                  onChange={(e) => {
                    setFormStart(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="h-10 rounded-xl border-[#e8e4dc]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#15182b]">
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
                  className="h-10 rounded-xl border-[#e8e4dc]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#15182b]">
                Notas <span className="font-normal text-[#6b7185]">(opcional)</span>
              </Label>
              <Input
                placeholder="Sala, instructor, requisitos..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="h-10 rounded-xl border-[#e8e4dc]"
              />
            </div>

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

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 h-10 rounded-xl border border-[#e8e4dc] bg-[#f6f3ee] text-sm text-[#6b7185] hover:bg-[#eaf0fb] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-10 rounded-xl bg-[#2d4a8a] text-white text-sm font-medium hover:bg-[#15182b] disabled:opacity-50 transition-colors"
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