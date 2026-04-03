"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormError from "@/components/ui/form-error";
import { GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// Query profiles for the role. Falls back to /portal if the query fails —
// the proxy will enforce correct access based on role.
async function resolveRedirect(supabase: SupabaseClient, userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!error && data?.role) {
      return data.role === "ADMIN" ? "/admin/dashboard" : "/portal";
    }

    console.warn("[login] profiles query failed:", error?.message);
  } catch (err) {
    console.warn("[login] profiles fetch error:", err);
  }

  return "/portal";
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
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
    router.push(redirect);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    await signIn(email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center login-bg px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#f0f2eb]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#dde0d4]/40 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d4a2b] to-[#4a7c59] mb-4 shadow-lg shadow-[#2d4a2b]/20">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e2d1c] tracking-tight">ALUMCO</h1>
          <p className="text-sm text-[#7d8471] mt-1">Plataforma de Capacitaci&oacute;n</p>
        </div>

        <Card className="border-[#dde0d4]/80 shadow-xl shadow-[#1e2d1c]/[0.04] animate-fade-in-up stagger-2 backdrop-blur-sm bg-[#faf9f6]/95">
          <CardContent className="p-7 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {errors.general && (
                <FormError id="general-error">{errors.general}</FormError>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#1e2d1c]">
                  Correo electr&oacute;nico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@alumco.cl"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                  className="h-12 text-base rounded-xl border-[#dde0d4] focus:border-[#4a7c59] focus:ring-[#a4ac86] transition-colors"
                  required
                />
                {errors.email && <FormError id="email-error">{errors.email}</FormError>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#1e2d1c]">
                  Contrase&ntilde;a
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  aria-invalid={!!errors.password}
                  className="h-12 text-base rounded-xl border-[#dde0d4] focus:border-[#4a7c59] focus:ring-[#a4ac86] transition-colors"
                  required
                />
                {errors.password && <FormError id="password-error">{errors.password}</FormError>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2d4a2b] to-[#4a7c59] text-white font-medium text-base hover:from-[#1e3a1c] hover:to-[#3d6b4a] transition-all duration-200 shadow-md shadow-[#2d4a2b]/20 hover:shadow-lg hover:shadow-[#2d4a2b]/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Iniciando..." : "Iniciar sesi\u00f3n"}
              </button>
            </form>

          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#6b7260] mt-6 animate-fade-in stagger-4">
          ALUMCO &mdash; Capacitaci&oacute;n para residencias de adultos mayores
        </p>
      </div>
    </div>
  );
}
