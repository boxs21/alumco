"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RoleOption = "admin" | "colaborador";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleOption>("admin");
  const [email, setEmail] = useState("admin@alumco.cl");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(selectedRole: RoleOption) {
    if (typeof window !== "undefined") {
      localStorage.setItem("alumco-role", selectedRole);
    }
    if (selectedRole === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/portal");
    }
  }

  function handleRoleSwitch(r: RoleOption) {
    setRole(r);
    setEmail(r === "admin" ? "admin@alumco.cl" : "colaborador@alumco.cl");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0d3a2e] via-forest to-teal">
      <div className="login-card w-full max-w-[420px] bg-white rounded-2xl p-12 shadow-[0_32px_80px_rgba(0,0,0,0.25)]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-9">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-forest to-forest-light flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3C8 3 5 7 5 11c0 5 7 11 7 11s7-6 7-11c0-4-3-8-7-8z" fill="white" opacity="0.9"/>
              <path d="M12 8v8M9 11l3-3 3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <strong className="font-serif text-[22px] text-ink block leading-none">
              ALUMCO
            </strong>
            <span className="text-base text-muted tracking-wide uppercase">
              Plataforma de Capacitación
            </span>
          </div>
        </div>

        {/* Título */}
        <h2 className="font-serif text-[26px] text-ink mb-1.5">Bienvenido</h2>
        <p className="text-base text-muted mb-6">
          Ingresa a tu cuenta para continuar
        </p>

        {/* Toggle de rol */}
        <div className="flex gap-2 mb-5" role="group" aria-label="Seleccionar tipo de usuario">
          {(
            [
              ["admin", "Administrador"],
              ["colaborador", "Colaborador"],
            ] as const
          ).map(([r, label]) => (
            <button
              key={r}
              onClick={() => handleRoleSwitch(r)}
              aria-pressed={role === r}
              className={`
                flex-1 min-h-[44px] py-2.5 rounded-lg border-[1.5px] text-base font-medium
                cursor-pointer font-sans transition-colors
                ${
                  role === r
                    ? "border-forest-mid bg-forest-mid/[0.07] text-forest"
                    : "border-border bg-surface text-muted hover:border-forest-mid/50"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Email */}
        <label
          htmlFor="login-email"
          className="block text-base font-semibold tracking-wide uppercase text-muted mb-2"
        >
          Correo electrónico
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-4 rounded-lg border-[1.5px] border-border bg-surface text-ink text-base font-sans outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-colors"
        />

        {/* Contraseña */}
        <label
          htmlFor="login-password"
          className="block text-base font-semibold tracking-wide uppercase text-muted mb-2"
        >
          Contraseña
        </label>
        <div className="relative mb-6">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-lg border-[1.5px] border-border bg-surface text-ink text-base font-sans outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-ink transition-colors cursor-pointer"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/>
                <circle cx="10" cy="10" r="2.5"/>
                <path d="M3 3l14 14" strokeWidth="1.8"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/>
                <circle cx="10" cy="10" r="2.5"/>
              </svg>
            )}
          </button>
        </div>

        {/* Botón login */}
        <button
          onClick={() => handleLogin(role)}
          className="w-full min-h-[48px] py-3.5 rounded-lg bg-forest text-white text-[17px] font-medium font-sans cursor-pointer hover:bg-forest-mid active:bg-forest-light transition-colors"
        >
          Iniciar sesión
        </button>

        {/* Demo */}
        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-base text-muted text-center mb-3 uppercase tracking-wide">
            Acceso rápido demo
          </p>
          <div className="flex gap-2 btn-row">
            <button
              onClick={() => handleLogin("admin")}
              className="flex-1 min-h-[44px] py-2.5 rounded-lg border-[1.5px] border-border bg-surface text-forest text-base font-medium font-sans cursor-pointer hover:bg-teal-light transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => handleLogin("colaborador")}
              className="flex-1 min-h-[44px] py-2.5 rounded-lg border-[1.5px] border-border bg-surface text-forest text-base font-medium font-sans cursor-pointer hover:bg-teal-light transition-colors"
            >
              Colaborador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
