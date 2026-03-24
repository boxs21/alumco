"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 mb-4">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ALUMCO</h1>
          <p className="text-sm text-slate-500 mt-1">Plataforma de Capacitación</p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            {/* Role Toggle */}
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                  role === "admin"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Administrador
              </button>
              <button
                type="button"
                onClick={() => setRole("collaborator")}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                  role === "collaborator"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Colaborador
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@alumco.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 text-base"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 transition-colors"
              >
                Iniciar sesión
              </button>
            </form>

            {/* Demo Buttons */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-500">Acceso rápido de prueba</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin("admin")}
                  className="h-11 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Admin demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin("collaborator")}
                  className="h-11 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Colaborador demo
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
