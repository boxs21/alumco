"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Loader2, MapPin, Monitor, Award } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

async function resolveRedirect(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (error) console.error("[login] profiles query error:", error.code, error.message);
  if (profile?.role === "ADMIN") return "/admin/dashboard";
  if (profile?.role === "PROFESOR") return "/admin/dashboard";
  if (profile?.role === "COLLABORATOR") return "/portal";
  console.warn("[login] role not determined, defaulting to /portal. Profile:", profile);
  return "/portal";
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const DEMO_USERS = [
  { label: "Admin",       email: "valentina@alumco.cl" },
  { label: "Profesor",    email: "carlos@alumco.cl"    },
  { label: "Colaborador", email: "maria@alumco.cl"     },
];

const STATS = [
  { icon: MapPin,  title: "2 Sedes",       sub: "Concepción y Coyhaique" },
  { icon: Monitor, title: "100% Digital",  sub: "Sin papel ni Excel"      },
  { icon: Award,   title: "Certificados",  sub: "Validados y auditables"  },
];

export default function LoginPage() {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]           = useState<FormErrors>({});
  const [loading, setLoading]         = useState(false);

  function validateForm(): boolean {
    const e: FormErrors = {};
    if (!email.trim())          e.email    = "El correo electrónico es requerido";
    else if (!email.includes("@")) e.email = "Por favor ingresa un correo válido";
    if (!password.trim())       e.password = "La contraseña es requerida";
    else if (password.length < 6) e.password = "La contraseña debe tener al menos 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function signIn(emailVal: string, passwordVal: string) {
    setLoading(true);
    setErrors({});
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailVal, password: passwordVal });
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
    <div className="min-h-screen flex">

      {/* ─────────────────────────────────────────────
          LEFT PANEL  (60%, desktop only)
      ───────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-[60%] relative flex-col items-center justify-center overflow-hidden px-16"
        style={{ background: "linear-gradient(135deg, #1A2F6B 0%, #2B4BA8 100%)" }}
      >
        {/* Decorative corner triangles */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="0,0 28,0 0,28"   fill="#E8445A" opacity="0.08" />
          <polygon points="0,0 14,0 0,14"   fill="#F5A623" opacity="0.10" />
          <polygon points="100,0 72,0 100,28"  fill="#7DC352" opacity="0.08" />
          <polygon points="100,0 86,0 100,14"  fill="#F5A623" opacity="0.07" />
          <polygon points="0,100 28,100 0,72"  fill="#F5A623" opacity="0.08" />
          <polygon points="0,100 14,100 0,86"  fill="#7DC352" opacity="0.07" />
          <polygon points="100,100 72,100 100,72" fill="#7DC352" opacity="0.09" />
          <polygon points="100,100 86,100 100,86" fill="#E8445A" opacity="0.08" />
          {/* Subtle center accent */}
          <polygon points="50,38 58,52 42,52" fill="#FFFFFF" opacity="0.04" />
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
          <Image
            src="/logo.png"
            alt="ALUMCO"
            width={240}
            height={90}
            className="mb-8 drop-shadow-lg"
            priority
          />

          <p className="text-white/90 text-xl font-light leading-relaxed tracking-wide">
            Capacitando al equipo que<br />cuida a los nuestros
          </p>

          <div className="w-16 h-px bg-white/25 my-10" />

          {/* Stat cards */}
          <div className="flex gap-3 w-full">
            {STATS.map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex-1 flex flex-col items-center gap-2 rounded-2xl p-4 border border-white/15 bg-white/10 backdrop-blur-sm"
              >
                <Icon className="h-5 w-5 text-white/75" />
                <p className="text-white font-semibold text-sm leading-tight">{title}</p>
                <p className="text-white/55 text-xs leading-snug text-center">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          RIGHT PANEL  (40% desktop / full mobile)
      ───────────────────────────────────────────── */}
      <div className="flex-1 lg:w-[40%] bg-white flex flex-col min-h-screen">
        {/* Centered form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 py-12">
          <div className="w-full max-w-sm">

            {/* Mobile: full logo */}
            <div className="flex justify-center mb-10 lg:hidden">
              <Image
                src="/logo.png"
                alt="ALUMCO"
                width={180}
                height={68}
                priority
              />
            </div>

            {/* Desktop: small wordmark */}
            <div className="hidden lg:block mb-10">
              <span className="text-2xl font-bold text-[#2B4BA8]">ALUMCO</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-[28px] font-bold text-gray-800 leading-tight">
                Bienvenido de vuelta
              </h1>
              <p className="text-sm text-gray-400 mt-1.5">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Demo access */}
            <div className="mb-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                Acceso demo
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_USERS.map(({ label, email: e }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={loading}
                    onClick={() => signIn(e, "12341234")}
                    className="h-9 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600 hover:bg-[#EEF2FF] hover:border-[#2B4BA8] hover:text-[#2B4BA8] transition-all disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] text-gray-300 font-medium">o inicia sesión</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {errors.general && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {errors.general}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@alumco.cl"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    aria-invalid={!!errors.email}
                    className={`w-full h-11 pl-10 pr-4 rounded-lg border text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 bg-red-50"
                        : "border-gray-200 focus:border-[#2B4BA8] bg-white"
                    }`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    aria-invalid={!!errors.password}
                    className={`w-full h-11 pl-10 pr-12 rounded-lg border text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors ${
                      errors.password
                        ? "border-red-300 focus:border-red-400 bg-red-50"
                        : "border-gray-200 focus:border-[#2B4BA8] bg-white"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#E8445A] hover:bg-[#cc3349] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
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

            {/* Help text */}
            <p className="text-xs text-center text-gray-400 mt-5">
              ¿Problemas para ingresar?{" "}
              <span className="text-[#2B4BA8]">Contacta al administrador</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="py-5 text-center border-t border-gray-50">
          <p className="text-xs text-gray-300">
            ALUMCO &copy; {new Date().getFullYear()} · Plataforma de Capacitación Interna
          </p>
        </div>
      </div>
    </div>
  );
}
