"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, BookOpen, History, LogOut } from "lucide-react";
import SedeBadge from "@/components/shared/SedeBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Mis capacitaciones", href: "/portal", icon: BookOpen },
  { label: "Historial", href: "/portal/historial", icon: History },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-bold text-slate-900">ALUMCO</span>
            </Link>

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-indigo-500" : "text-slate-400"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <SedeBadge sedeId="s1" sedeName="Concepción" size="md" />
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-medium">
                  MG
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-900">María González</span>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
    </div>
  );
}
