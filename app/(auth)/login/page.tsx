"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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


function LoginBlob() {
  return (
    <svg viewBox="0 0 480 400" className="w-full max-w-[480px] self-center" style={{ margin: "20px 0" }} aria-hidden="true">
      <defs>
        <linearGradient id="lb1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ff7c6b" stopOpacity="0.9" />
          <stop offset="1" stopColor="#e86154" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="lb2" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f2b544" />
          <stop offset="1" stopColor="#e09226" />
        </linearGradient>
      </defs>
      {/* giant coral blob */}
      <path
        d="M90,210 C40,150 80,60 180,50 C280,40 320,10 400,80 C480,150 430,300 330,330 C230,360 140,270 90,210 Z"
        fill="url(#lb1)" opacity="0.95"
      />
      {/* mustard circle */}
      <circle cx="110" cy="110" r="52" fill="url(#lb2)" />
      {/* cream blob */}
      <path
        d="M200,230 C200,180 260,160 310,180 C360,200 370,270 330,300 C290,330 230,320 210,280 C200,260 200,250 200,230 Z"
        fill="#f6f3ee" opacity="0.98"
      />
      {/* navy ring */}
      <circle cx="370" cy="130" r="28" fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="4 6" opacity="0.7" />
      {/* line sprig */}
      <path d="M150,170 Q220,120 300,160" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <circle cx="300" cy="160" r="5" fill="white" />
      <circle cx="150" cy="170" r="5" fill="#f2b544" />
      {/* confetti */}
      <rect x="60" y="300" width="12" height="12" rx="3" fill="white" opacity="0.85" transform="rotate(20 66 306)" />
      <rect x="410" y="260" width="10" height="10" rx="2" fill="#f2b544" transform="rotate(-15 415 265)" />
      <circle cx="440" cy="330" r="5" fill="white" opacity="0.8" />
      <circle cx="50" cy="80" r="4" fill="#f2b544" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState<FormErrors>({});
  const [loading, setLoading]           = useState(false);

  function validateForm(): boolean {
    const e: FormErrors = {};
    if (!email.trim())           e.email    = "El correo electrónico es requerido";
    else if (!email.includes("@")) e.email  = "Por favor ingresa un correo válido";
    if (!password.trim())        e.password = "La contraseña es requerida";
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

      {/* ── LEFT — visual panel ── */}
      <aside
        className="hidden lg:flex w-[52%] relative flex-col justify-between overflow-hidden px-11 py-9"
        style={{ background: "linear-gradient(140deg, #2d4a8a 0%, #1f3769 55%, #16284d 100%)" }}
      >
        {/* Radial coral glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-80px] bottom-[-100px] w-[320px] h-[320px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,124,107,0.35), transparent 70%)" }}
        />

        {/* Top: brand */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="ALUMCO" width={140} height={44} className="object-contain brightness-0 invert" priority />
          </div>
          <span
            className="text-[10.5px] font-[600] text-white/80 px-3 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            Plataforma de capacitación
          </span>
        </div>

        {/* Center: blob illustration */}
        <div className="relative z-10 flex justify-center">
          <LoginBlob />
        </div>

        {/* Bottom: quote */}
        <div className="relative z-10">
          <p className="text-[10.5px] font-[700] uppercase tracking-[0.18em] text-white/60 mb-3">
            Nuestro compromiso
          </p>
          <h2 className="text-[28px] font-[700] leading-[1.2] tracking-[-0.025em] text-white mb-5 max-w-[520px]">
            Dedicadas a brindar el más{" "}
            <em className="text-[#ffd4cc] not-italic" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>
              alto estándar
            </em>{" "}
            de cuidado para nuestras{" "}
            <em className="text-[#ffd4cc] not-italic" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>
              personas mayores.
            </em>
          </h2>
          <div className="border-t border-white/12 pt-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-[34px] w-[34px] items-center justify-center rounded-xl text-[11px] font-[700] text-[#4a3410]"
                style={{ background: "#f2b544" }}
              >
                AL
              </div>
              <div>
                <p className="text-[13px] font-[700] text-white">ALUMCO · Concepción &amp; Coyhaique</p>
              
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT — form ── */}
      <section className="flex-1 flex items-center justify-center px-8 sm:px-12 py-12" style={{ background: "#f6f3ee" }}>
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Image src="/logo.png" alt="ALUMCO" width={120} height={38} className="object-contain" priority />
          </div>

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffe6e1] text-[#e86154] text-[11px] font-[700] uppercase tracking-[0.08em] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff7c6b]" />
            Ingreso seguro
          </div>

          <h1 className="text-[32px] font-[800] tracking-[-0.03em] leading-[1.1] mb-2 text-[#15182b]">
            Bienvenida de vuelta,{" "}
            <em style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontStyle: "italic", fontWeight: 500, color: "#ff7c6b" }}>
              cuidadora.
            </em>
          </h1>
          <p className="text-[14px] text-[#6b7185] leading-[1.55] mb-6">
            Accede a tus capacitaciones y continúa creciendo con el equipo.
          </p>

          {/* Demo access */}
          <div className="mb-5">
            <p className="text-[10.5px] font-[700] uppercase tracking-[0.14em] text-[#a5a9b8] mb-2">
              Acceso demo
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_USERS.map(({ label, email: e }) => (
                <button
                  key={label}
                  type="button"
                  disabled={loading}
                  onClick={() => signIn(e, "12341234")}
                  className="h-9 rounded-xl border border-[#e8e4dc] bg-white text-[12.5px] font-[600] text-[#6b7185] hover:border-[#2d4a8a] hover:text-[#2d4a8a] hover:bg-[#eaf0fb] transition-all disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#e8e4dc]" />
            <span className="text-[11px] font-[700] uppercase tracking-[0.14em] text-[#a5a9b8]">o inicia sesión</span>
            <div className="flex-1 h-px bg-[#e8e4dc]" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            {errors.general && (
              <div className="rounded-xl bg-[#ffe6e1] border border-[#ffccc5] px-4 py-3 text-[13px] text-[#e86154]">
                {errors.general}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11.5px] font-[600] text-[#6b7185] tracking-[0.02em]">
                Correo ALUMCO
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nombre.apellido@alumco.cl"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                aria-invalid={!!errors.email}
                className={`w-full h-12 px-3.5 rounded-xl text-[13px] text-[#15182b] placeholder-[#a5a9b8] outline-none transition-all ${
                  errors.email
                    ? "border border-[#ff7c6b] bg-[#ffe6e1]"
                    : "border border-transparent bg-[#f0ece4] focus:bg-white focus:border-[#2d4a8a]"
                }`}
                required
              />
              {errors.email && (
                <p className="text-[11.5px] text-[#e86154]">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[11.5px] font-[600] text-[#6b7185] tracking-[0.02em]">
                  Contraseña
                </label>
                <a href="/forgot-password" className="text-[11.5px] font-[600] text-[#ff7c6b] hover:underline">
                  ¿Olvidaste?
                </a>
              </div>
              <div className="relative">
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
                  className={`w-full h-12 px-3.5 pr-12 rounded-xl text-[13px] text-[#15182b] placeholder-[#a5a9b8] outline-none transition-all ${
                    errors.password
                      ? "border border-[#ff7c6b] bg-[#ffe6e1]"
                      : "border border-transparent bg-[#f0ece4] focus:bg-white focus:border-[#2d4a8a]"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a5a9b8] hover:text-[#6b7185] transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11.5px] text-[#e86154]">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[14px] bg-[#ff7c6b] hover:bg-[#e86154] text-white text-[14px] font-[600] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 pt-5 border-t border-[#e8e4dc]">
            <p className="text-[12.5px] text-[#6b7185] leading-[1.6]">
              ¿No tienes cuenta? Pide acceso a tu <strong className="text-[#15182b]">administradora de sede</strong>.
            </p>
            <div className="flex gap-2.5 mt-3 text-[11px] text-[#a5a9b8]">
              <span>ALUMCO © 2026</span>
              <span>·</span>
              <a href="#" className="hover:underline">Privacidad</a>
              <span>·</span>
              <a href="#" className="hover:underline">Soporte</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
