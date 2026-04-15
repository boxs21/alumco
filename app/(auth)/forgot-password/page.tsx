"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormError from "@/components/ui/form-error";
import { Leaf, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError("El correo electrónico es requerido");
      return;
    }
    if (!email.includes("@")) {
      setEmailError("Por favor ingresa un correo válido");
      return;
    }

    setLoading(true);
    setEmailError("");

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Always show success — don't reveal whether the email exists
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f4f0] px-4 relative overflow-hidden">
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
        </div>

        <Card className="border-[#dde0d4] shadow-sm animate-fade-in-up stagger-2 bg-white">
          <CardContent className="p-8">
            {sent ? (
              <div className="flex flex-col items-center text-center gap-4 py-2">
                <CheckCircle2 className="h-10 w-10 text-[#4a7c59]" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-[#1e2d1c]">Revisa tu correo</p>
                  <p className="text-sm text-[#7d8471] mt-1">
                    Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="text-sm text-[#4a7c59] hover:text-[#2d4a2b] font-medium transition-colors flex items-center gap-1.5 mt-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h1 className="text-base font-semibold text-[#1e2d1c]">Restablecer contraseña</h1>
                  <p className="text-sm text-[#7d8471] mt-1">
                    Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        if (emailError) setEmailError("");
                      }}
                      aria-describedby={emailError ? "email-error" : undefined}
                      aria-invalid={!!emailError}
                      className="h-11 text-sm rounded-lg border-[#dde0d4] focus:border-[#4a7c59] focus:ring-[#a4ac86] transition-colors"
                      required
                    />
                    {emailError && <FormError id="email-error">{emailError}</FormError>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-lg bg-[#2d4a2b] text-white text-sm font-medium hover:bg-[#1e3a1c] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar enlace"
                    )}
                  </button>
                </form>

                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm text-[#7d8471] hover:text-[#1e2d1c] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Volver al inicio de sesión
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#a4ac86] mt-8 animate-fade-in stagger-4">
          ALUMCO &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
