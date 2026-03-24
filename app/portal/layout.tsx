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
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#dde0d4] bg-white">
        <div className="mx-auto max-w-5xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-bold text-[#1e2d1c]">ALUMCO</span>
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
                        : "text-[#7d8471] hover:bg-[#f0f2eb]/60 hover:text-[#1e2d1c]"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-indigo-500" : "text-[#a4ac86]"}`} />
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
              <span className="text-sm font-medium text-[#1e2d1c]">María González</span>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#7d8471] hover:bg-[#f0f2eb]/60 hover:text-[#1e2d1c] transition-colors"
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
