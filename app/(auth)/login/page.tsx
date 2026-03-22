"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RoleOption = "admin" | "colaborador";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleOption>("admin");
  const [email, setEmail] = useState("admin@alumco.cl");
  const [password, setPassword] = useState("••••••••");

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
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-forest to-forest-light flex items-center justify-center text-[22px] shrink-0">
            🌱
          </div>
          <div>
            <strong className="font-serif text-[22px] text-ink block leading-none">
              ALUMCO
            </strong>
            <span className="text-[11px] text-muted tracking-wide uppercase">
              Plataforma de Capacitación
            </span>
          </div>
        </div>

        {/* Título */}
        <h2 className="font-serif text-[26px] text-ink mb-1.5">Bienvenido</h2>
        <p className="text-muted text-base mb-6">
          Ingresa a tu cuenta para continuar
        </p>

        {/* Toggle de rol */}
        <div className="flex gap-2 mb-5">
          {(
            [
              ["admin", "👤 Administrador"],
              ["colaborador", "📚 Colaborador"],
            ] as const
          ).map(([r, label]) => (
            <button
              key={r}
              onClick={() => handleRoleSwitch(r)}
              className={`
                flex-1 py-2.5 rounded-lg border-[1.5px] text-base font-medium
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
        <label className="block text-xs font-semibold tracking-wide uppercase text-muted mb-2">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-4 rounded-lg border-[1.5px] border-border bg-surface text-ink text-base font-sans outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-colors"
        />

        {/* Contraseña */}
        <label className="block text-xs font-semibold tracking-wide uppercase text-muted mb-2">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 mb-6 rounded-lg border-[1.5px] border-border bg-surface text-ink text-base font-sans outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-colors"
        />

        {/* Botón login */}
        <button
          onClick={() => handleLogin(role)}
          className="w-full min-h-[48px] py-3.5 rounded-lg bg-forest text-white text-[17px] font-medium font-sans cursor-pointer hover:bg-forest-mid active:bg-forest-light transition-colors"
        >
          Iniciar sesión
        </button>

        {/* Demo */}
        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-[11px] text-muted text-center mb-3 uppercase tracking-wide">
            Acceso rápido demo
          </p>
          <div className="flex gap-2 btn-row">
            <button
              onClick={() => handleLogin("admin")}
              className="flex-1 py-2.5 rounded-lg border-[1.5px] border-border bg-surface text-forest text-sm font-medium font-sans cursor-pointer hover:bg-teal-light transition-colors"
            >
              🔧 Admin
            </button>
            <button
              onClick={() => handleLogin("colaborador")}
              className="flex-1 py-2.5 rounded-lg border-[1.5px] border-border bg-surface text-forest text-sm font-medium font-sans cursor-pointer hover:bg-teal-light transition-colors"
            >
              📖 Colaborador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
