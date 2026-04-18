"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Topbar from "@/components/layout/Topbar";
import SedeBadge from "@/components/shared/SedeBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";
import { SEDES, AREAS, sedeName } from "@/lib/config";
import {
  Users,
  Building2,
  Briefcase,
  UserCheck,
  Calendar,
  ArrowLeft,
  Check,
} from "lucide-react";

type TargetType = "ALL" | "SEDE" | "AREA" | "INDIVIDUAL";

const targetOptions: { key: TargetType; label: string; description: string; icon: typeof Users }[] = [
  { key: "ALL",        label: "Todos los colaboradores", description: "Asignar a todas las sedes", icon: Users },
  { key: "SEDE",       label: "Una sede completa",       description: "Todos los de una sede",      icon: Building2 },
  { key: "AREA",       label: "Por área o cargo",        description: "Un área específica",         icon: Briefcase },
  { key: "INDIVIDUAL", label: "Colaboradores específicos", description: "Seleccionar manually",  icon: UserCheck },
];

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  area: string | null;
  sede_id: string | null;
  active: boolean;
}

export default function AsignarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [targetType, setTargetType] = useState<TargetType | null>(null);
  const [targetSede, setTargetSede] = useState<string | null>(null);
  const [targetArea, setTargetArea] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [trainingTitle, setTrainingTitle] = useState("");
  const [collaborators, setCollaborators] = useState<Profile[]>([]);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [saving,    setSaving]      = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [
        { data: trainingData },
        { data: profilesData, error: profilesError },
      ] = await Promise.all([
        supabase.from("trainings").select("title").eq("id", id).single(),
        supabase.from("profiles").select("id, name, email, area, sede_id, active").eq("role", "COLLABORATOR").order("name"),
      ]);
      if (profilesError) {
        setLoadError(`${profilesError.code}: ${profilesError.message}`);
        return;
      }
      setTrainingTitle(trainingData?.title ?? "Capacitación");
      setCollaborators(profilesData ?? []);
    }
    load();
  }, [id]);

  const filteredCollaborators = useMemo(() => {
    let list = collaborators;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          (u.name ?? "").toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, collaborators]);

  const affectedCount = useMemo(() => {
    if (targetType === "ALL")                      return collaborators.length;
    if (targetType === "SEDE" && targetSede)       return collaborators.filter((u) => u.sede_id === targetSede).length;
    if (targetType === "AREA" && targetArea)       return collaborators.filter((u) => u.area === targetArea).length;
    if (targetType === "INDIVIDUAL")               return selectedUsers.size;
    return 0;
  }, [targetType, targetSede, targetArea, selectedUsers, collaborators]);

  async function handleConfirm() {
    if (!targetType || saving) return;
    setSaving(true);
    setSaveError(null);

    const supabase = createClient();
    let error: { message: string } | null = null;

    if (targetType === "INDIVIDUAL") {
      // One row per selected user
      const rows = [...selectedUsers].map((userId) => ({
        training_id:  id,
        target_type:  "INDIVIDUAL",
        user_id:      userId,
        status:       "PENDING",
        due_date:     dueDate || null,
      }));
      const res = await supabase.from("assignments").insert(rows);
      error = res.error;
    } else {
      // One row for the group target
      const row: Record<string, unknown> = {
        training_id:  id,
        target_type:  targetType,
        status:       "PENDING",
        due_date:     dueDate || null,
      };
      if (targetType === "SEDE" && targetSede)   row.target_sede_id = targetSede;
      if (targetType === "AREA" && targetArea)   row.target_area    = targetArea;
      const res = await supabase.from("assignments").insert(row);
      error = res.error;
    }

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    toast.success("Capacitación asignada correctamente");
    router.push(`/admin/capacitaciones/${id}`);
  }

  function toggleUser(userId: string) {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }


  if (loadError) {
    return (
      <div>
        <Topbar title="Asignar colaboradores" sub="Error al cargar." />
        <div className="p-6 text-sm text-red-600">Error al cargar colaboradores: {loadError}</div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Asignar colaboradores" sub={trainingTitle} />

      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-4 lg:space-y-6">
        {/* Target Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-[#15182b]">Tipo de asignación</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {targetOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setTargetType(opt.key);
                  setTargetSede(null);
                  setTargetArea(null);
                  setSelectedUsers(new Set());
                }}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  targetType === opt.key
                    ? "border-[#a5a9b8] bg-[#eaf0fb] ring-2 ring-[#2d4a8a]"
                    : "border-[#e8e4dc] bg-[#f6f3ee] hover:bg-[#eaf0fb]/60"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eaf0fb]">
                  <opt.icon className={`h-5 w-5 ${targetType === opt.key ? "text-[#2d4a8a]" : "text-[#a5a9b8]"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#15182b]">{opt.label}</p>
                  <p className="text-xs text-[#6b7185] mt-0.5">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sede selector */}
        {targetType === "SEDE" && (
          <Card className="border-[#e8e4dc] shadow-sm">
            <CardContent className="p-5 space-y-3">
              <Label className="text-sm font-medium text-[#15182b]">Seleccionar sede</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(SEDES).map((sede) => (
                  <button
                    key={sede.id}
                    type="button"
                    onClick={() => setTargetSede(sede.id)}
                    className={`p-4 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                      targetSede === sede.id
                        ? "border-[#a5a9b8] bg-[#eaf0fb] ring-2 ring-[#2d4a8a]"
                        : "border-[#e8e4dc] bg-[#f6f3ee] hover:bg-[#eaf0fb]/60"
                    }`}
                  >
                    {sede.nombre}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Area selector */}
        {targetType === "AREA" && (
          <Card className="border-[#e8e4dc] shadow-sm">
            <CardContent className="p-5 space-y-3">
              <Label className="text-sm font-medium text-[#15182b]">Seleccionar área</Label>
              <div className="flex gap-2 flex-wrap">
                {AREAS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setTargetArea(a)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      targetArea === a
                        ? "border-[#a5a9b8] bg-[#eaf0fb] text-[#15182b]"
                        : "border-[#e8e4dc] bg-[#f6f3ee] text-[#6b7185] hover:bg-[#eaf0fb]/60"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual selector */}
        {targetType === "INDIVIDUAL" && (
          <Card className="border-[#e8e4dc] shadow-sm">
            <CardContent className="p-5 space-y-3">
              <Input
                placeholder="Buscar colaborador por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 text-base"
              />
              {filteredCollaborators.length === 0 ? (
                <p className="text-sm text-[#6b7185] text-center py-4">Sin colaboradores.</p>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {filteredCollaborators.map((user) => {
                    const name = user.name ?? user.email ?? "—";
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleUser(user.id)}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                          selectedUsers.has(user.id) ? "bg-[#eaf0fb]" : "hover:bg-[#eaf0fb]/60"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                            selectedUsers.has(user.id) ? "border-[#2d4a8a] bg-[#2d4a8a]" : "border-[#e8e4dc]"
                          }`}
                        >
                          {selectedUsers.has(user.id) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${user.active ? "text-[#15182b]" : "text-[#a5a9b8]"}`}>
                            {name}
                            {!user.active && <span className="ml-1.5 text-xs font-normal">(Inactivo)</span>}
                          </p>
                          {user.area && <p className="text-xs text-[#6b7185]">{user.area}</p>}
                        </div>
                        <SedeBadge sedeId={user.sede_id} sedeName={sedeName(user.sede_id)} size="sm" />
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Due date */}
        {targetType && (
          <Card className="border-[#e8e4dc] shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#a5a9b8]" />
                <div className="flex-1">
                  <Label htmlFor="dueDate" className="text-sm font-medium text-[#15182b]">
                    Fecha límite (opcional)
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-11 text-base mt-1 w-56"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary & Submit */}
        {targetType && (
          <Card className="border-[#e8e4dc] bg-[#eaf0fb]/50 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#15182b]">Resumen de asignación</p>
                  <p className="text-sm text-[#6b7185] mt-0.5">
                    {affectedCount} {affectedCount === 1 ? "persona recibirá" : "personas recibirán"} esta capacitación
                    {dueDate && ` · Fecha límite: ${dueDate}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={affectedCount === 0 || saving}
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#2d4a8a] text-white text-sm font-medium hover:bg-[#15182b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {saving ? "Guardando…" : "Confirmar asignación"}
                </button>
              </div>
              {saveError && (
                <p className="text-sm text-red-600" role="alert">Error: {saveError}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6b7185] hover:text-[#15182b] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>
    </div>
  );
}
