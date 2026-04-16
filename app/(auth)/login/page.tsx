"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormError from "@/components/ui/form-error";
import { Leaf, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

async function resolveRedirect(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("[login] profiles query error:", error.code, error.message);
  }

  if (profile?.role === "ADMIN") return "/admin/dashboard";
  if (profile?.role === "COLLABORATOR") return "/portal";

  // Role unknown — default to portal; proxy will correct if needed
  console.warn("[login] role not determined, defaulting to /portal. Profile:", profile);
  return "/portal";
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validateForm(): boolean {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!email.includes("@")) {
      newErrors.email = "Por favor ingresa un correo válido";
    }
    if (!password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function signIn(emailVal: string, passwordVal: string) {
    setLoading(true);
    setErrors({});

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailVal,
      password: passwordVal,
    });

    if (error || !data.user) {
      setErrors({ general: "Correo o contraseña incorrectos" });
      setLoading(false);
      return;
    }

    const redirect = await resolveRedirect(supabase, data.user.id);
    window.location.href = redirect;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    await signIn(email, password);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#f5f4f0] px-4 relative overflow-hidden"
      style={{
        "--card": "#ffffff",
        "--card-foreground": "#2a3a4a",
        "--foreground": "#2a3a4a",
        "--border": "#d4e1ed",
        "--input": "#d4e1ed",
        "--background": "#fafbfc",
        "--secondary": "#e8eff7",
        "--muted-foreground": "#4a6a80",
      } as React.CSSProperties}
    >
      {/* Subtle grain texture — aria-hidden, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Wordmark */}
        <div className="flex flex-col items-center mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d4a2b]">
              <Leaf className="h-4 w-4 text-[#a4ac86]" aria-hidden="true" />
            </div>
            <span
              className="text-3xl font-bold tracking-tight text-[#1e2d1c]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ALUMCO
            </span>
          </div>
          <p className="text-sm text-[#7d8471]">Formación para residencias</p>
        </div>

        {/* Demo access */}
        <div className="mb-4 space-y-2 animate-fade-in-up stagger-2">
          <p className="text-xs text-center text-[#a4ac86] font-medium uppercase tracking-wide">Acceso demo</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => signIn("valentina@alumco.cl", "12341234")}
              className="h-10 rounded-lg border border-[#dde0d4] bg-white text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb] transition-colors disabled:opacity-50"
            >
              Admin
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => signIn("maria@alumco.cl", "12341234")}
              className="h-10 rounded-lg border border-[#dde0d4] bg-white text-sm font-medium text-[#1e2d1c] hover:bg-[#f0f2eb] transition-colors disabled:opacity-50"
            >
              Colaborador
            </button>
          </div>
        </div>

        <Card className="border-[#dde0d4] shadow-sm animate-fade-in-up stagger-3 bg-white">
          <CardContent className="p-8 space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              {errors.general && (
                <FormError id="general-error">{errors.general}</FormError>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-[#1e2d1c]">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@alumco.cl"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                  className="h-11 text-sm rounded-lg border-[#dde0d4] focus:border-[#4a7c59] focus:ring-[#a4ac86] transition-colors"
                  required
                />
                {errors.email && <FormError id="email-error">{errors.email}</FormError>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-[#1e2d1c]">
                    Contraseña
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#4a7c59] hover:text-[#2d4a2b] transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  aria-invalid={!!errors.password}
                  className="h-11 text-sm rounded-lg border-[#dde0d4] focus:border-[#4a7c59] focus:ring-[#a4ac86] transition-colors"
                  required
                />
                {errors.password && <FormError id="password-error">{errors.password}</FormError>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#a4ac86] mt-8 animate-fade-in stagger-4">
          ALUMCO &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
