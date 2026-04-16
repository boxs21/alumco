"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UserCog,
  Plus,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase";
import { SEDES, AREAS, sedeName } from "@/lib/config";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: "ADMIN" | "COLLABORATOR";
  area: string | null;
  sede_id: string | null;
  active: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function PersonalPage() {
  const router = useRouter();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [sedeTab, setSedeTab] = useState("ALL");
  const [showInactive, setShowInactive] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formRole, setFormRole] = useState<"COLLABORATOR" | "ADMIN">("COLLABORATOR");
  const [formSedeId, setFormSedeId] = useState("");
  const [formArea, setFormArea] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ─── Load ──────────────────────────────────────────────────────────────

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role, area, sede_id, active")
      .order("name");
    if (error) {
      setLoadError("No se pudo cargar el personal.");
      setLoading(false);
      return;
    }
    setProfiles((data ?? []) as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // ─── Filtered list ─────────────────────────────────────────────────────

  const visible = profiles.filter((p) => {
    if (!showInactive && !p.active) return false;
    if (sedeTab !== "ALL" && p.sede_id !== sedeTab) return false;
    return true;
  });

  // ─── Form reset ────────────────────────────────────────────────────────

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setShowPassword(false);
    setFormRole("COLLABORATOR");
    setFormSedeId("");
    setFormArea("");
    setFormError(null);
  }

  // ─── Create user ───────────────────────────────────────────────────────

  async function handleCreate() {
    if (!formName.trim() || !formEmail.trim() || !formPassword) {
      setFormError("Nombre, correo y contraseña son requeridos.");
      return;
    }
    if (!formEmail.includes("@")) {
      setFormError("Ingresa un correo válido.");
      return;
    }
    if (formPassword.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        sede_id: formSedeId || null,
        area: formArea || null,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setFormError(json.error ?? "Error al crear el usuario.");
      setSaving(false);
      return;
    }

    setShowModal(false);
    resetForm();
    loadProfiles();
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div>
      <Topbar title="Personal" />

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-5">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Sede tabs */}
            <div className="flex rounded-lg bg-[#f0f2eb] p-1">
              {[
                { key: "ALL",                label: "Todos" },
                { key: SEDES.CONCEPCION.id,  label: "Concepción" },
                { key: SEDES.COYHAIQUE.id,   label: "Coyhaique" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSedeTab(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    sedeTab === tab.key
                      ? "bg-[#faf9f6] text-[#1e2d1c] shadow-sm"
                      : "text-[#7d8471] hover:text-[#1e2d1c]",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inactivos toggle */}
            <button
              onClick={() => setShowInactive((v) => !v)}
              className={cn(
                "h-9 px-3 rounded-lg border text-sm font-medium transition-colors",
                showInactive
                  ? "border-[#2d4a2b] bg-[#f0f2eb] text-[#2d4a2b]"
                  : "border-[#dde0d4] bg-[#faf9f6] text-[#7d8471] hover:bg-[#f0f2eb]",
              )}
            >
              {showInactive ? "Mostrando inactivos" : "Ver inactivos"}
            </button>
          </div>

          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo usuario</span>
          </button>
        </div>

        {/* ── Load error ── */}
        {loadError && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {loadError}
          </div>
        )}

        {/* ── Table ── */}
        <Card className="border-[#dde0d4] shadow-sm animate-fade-in overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 text-center text-sm text-[#7d8471]">
                Cargando personal...
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-2xl bg-[#f0f2eb] flex items-center justify-center mb-3">
                  <UserCog className="h-6 w-6 text-[#a4ac86]" />
                </div>
                <p className="text-sm font-medium text-[#1e2d1c]">Sin usuarios</p>
                <p className="text-xs text-[#7d8471] mt-1">
                  Haz clic en &quot;Nuevo usuario&quot; para agregar uno.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f0f2eb] hover:bg-[#f0f2eb] border-b border-[#dde0d4]">
                    <TableHead className="text-[11px] font-semibold text-[#7d8471] uppercase tracking-wider">
                      Usuario
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-[#7d8471] uppercase tracking-wider hidden md:table-cell">
                      Rol
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-[#7d8471] uppercase tracking-wider hidden lg:table-cell">
                      Sede
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-[#7d8471] uppercase tracking-wider hidden lg:table-cell">
                      Área
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-[#7d8471] uppercase tracking-wider">
                      Estado
                    </TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((p) => (
                    <TableRow
                      key={p.id}
                      className="border-b border-[#dde0d4] hover:bg-[#f0f2eb]/40 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="text-xs font-semibold bg-[#f0f2eb] text-[#2d4a2b]">
                              {getInitials(p.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1e2d1c] truncate">
                              {p.name ?? "—"}
                            </p>
                            <p className="text-xs text-[#7d8471] truncate">
                              {p.email ?? "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          className={cn(
                            "text-[10px] font-medium border",
                            p.role === "ADMIN"
                              ? "bg-[#2d4a2b]/10 text-[#2d4a2b] border-[#2d4a2b]/20"
                              : "bg-[#f0f2eb] text-[#7d8471] border-[#dde0d4]",
                          )}
                        >
                          {p.role === "ADMIN" ? "Admin" : "Colaborador"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#7d8471] hidden lg:table-cell">
                        {sedeName(p.sede_id) ?? (
                          <span className="text-[#a4ac86]">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-[#7d8471] hidden lg:table-cell">
                        {p.area ?? <span className="text-[#a4ac86]">—</span>}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                            p.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-[#f0f2eb] text-[#a4ac86]",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              p.active ? "bg-emerald-500" : "bg-[#a4ac86]",
                            )}
                          />
                          {p.active ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {p.role === "COLLABORATOR" && (
                          <button
                            onClick={() =>
                              router.push(`/admin/colaboradores/${p.id}`)
                            }
                            className="h-7 px-2.5 rounded-lg text-xs text-[#2d4a2b] hover:bg-[#f0f2eb] transition-colors font-medium"
                          >
                            Ver
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ── Footer count ── */}
        {!loading && visible.length > 0 && (
          <p className="text-xs text-[#a4ac86] text-right">
            {visible.length} usuario{visible.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ── Create modal ── */}
      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          if (!open) { setShowModal(false); resetForm(); }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl border-[#dde0d4]">
          <DialogHeader>
            <DialogTitle className="text-[#1e2d1c]">Nuevo usuario</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e2d1c]">
                Nombre completo
              </Label>
              <Input
                placeholder="María González"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="h-10 rounded-xl border-[#dde0d4]"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e2d1c]">
                Correo electrónico
              </Label>
              <Input
                type="email"
                placeholder="maria@alumco.cl"
                value={formEmail}
                onChange={(e) => {
                  setFormEmail(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="h-10 rounded-xl border-[#dde0d4]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e2d1c]">
                Contraseña temporal
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mín. 6 caracteres"
                  value={formPassword}
                  onChange={(e) => {
                    setFormPassword(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="h-10 rounded-xl border-[#dde0d4] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a4ac86] hover:text-[#7d8471] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-[#1e2d1c]">Rol</Label>
              <Select
                value={formRole}
                onValueChange={(v) =>
                  setFormRole(v as "COLLABORATOR" | "ADMIN")
                }
              >
                <SelectTrigger className="h-10 rounded-xl border-[#dde0d4]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="COLLABORATOR">Colaborador</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sede + Area */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e2d1c]">Sede</Label>
                <Select value={formSedeId} onValueChange={setFormSedeId}>
                  <SelectTrigger className="h-10 rounded-xl border-[#dde0d4]">
                    <SelectValue placeholder="Sin sede" />
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[#1e2d1c]">Área</Label>
                <Select value={formArea} onValueChange={setFormArea}>
                  <SelectTrigger className="h-10 rounded-xl border-[#dde0d4]">
                    <SelectValue placeholder="Sin área" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {AREAS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Error */}
            {formError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {formError}
              </div>
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
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 h-10 rounded-xl bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear usuario"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
