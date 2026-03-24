"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Shield, User } from "lucide-react";

type RoleTab = "admin" | "collaborator";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleTab>("collaborator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("alumco_role", role === "admin" ? "ADMIN" : "COLLABORATOR");
    localStorage.setItem("alumco_user", email);
    router.push(role === "admin" ? "/admin/dashboard" : "/portal");
  }

  function handleDemoLogin(demoRole: RoleTab) {
    localStorage.setItem("alumco_role", demoRole === "admin" ? "ADMIN" : "COLLABORATOR");
    localStorage.setItem("alumco_user", demoRole === "admin" ? "valentina@alumco.cl" : "maria@alumco.cl");
    router.push(demoRole === "admin" ? "/admin/dashboard" : "/portal");
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
            {/* Role Toggle */}
            <div className="flex rounded-xl bg-[#f0f2eb]/80 p-1.5 gap-1">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
                  role === "admin"
                    ? "bg-[#faf9f6] text-[#1e2d1c] shadow-sm ring-1 ring-[#dde0d4]/60"
                    : "text-[#7d8471] hover:text-[#1e2d1c]"
                }`}
              >
                <Shield className={`h-4 w-4 ${role === "admin" ? "text-[#2d4a2b]" : ""}`} />
                Administrador
              </button>
              <button
                type="button"
                onClick={() => setRole("collaborator")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
                  role === "collaborator"
                    ? "bg-[#faf9f6] text-[#1e2d1c] shadow-sm ring-1 ring-[#dde0d4]/60"
                    : "text-[#7d8471] hover:text-[#1e2d1c]"
                }`}
              >
                <User className={`h-4 w-4 ${role === "collaborator" ? "text-[#2d4a2b]" : ""}`} />
                Colaborador
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#1e2d1c]">
                  Correo electr&oacute;nico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@alumco.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base rounded-xl border-[#dde0d4] focus:border-[#4a7c59] focus:ring-[#a4ac86] transition-colors"
                  required
                />
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base rounded-xl border-[#dde0d4] focus:border-[#4a7c59] focus:ring-[#a4ac86] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2d4a2b] to-[#4a7c59] text-white font-medium text-base hover:from-[#1e3a1c] hover:to-[#3d6b4a] transition-all duration-200 shadow-md shadow-[#2d4a2b]/20 hover:shadow-lg hover:shadow-[#2d4a2b]/30 active:scale-[0.98]"
              >
                Iniciar sesi&oacute;n
              </button>
            </form>

            {/* Demo Buttons */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#dde0d4]/80" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#faf9f6]/95 px-3 text-[#a4ac86] font-medium">Acceso r&aacute;pido de prueba</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin("admin")}
                  className="h-11 rounded-xl border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#7d8471] hover:bg-[#f0f2eb]/60 hover:border-[#a4ac86] transition-all duration-200 active:scale-[0.98]"
                >
                  Admin demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin("collaborator")}
                  className="h-11 rounded-xl border border-[#dde0d4] bg-[#faf9f6] text-sm font-medium text-[#7d8471] hover:bg-[#f0f2eb]/60 hover:border-[#a4ac86] transition-all duration-200 active:scale-[0.98]"
                >
                  Colaborador demo
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#a4ac86] mt-6 animate-fade-in stagger-4">
          ALUMCO &mdash; Capacitaci&oacute;n para residencias de adultos mayores
        </p>
      </div>
    </div>
  );
}
