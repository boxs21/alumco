"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, BookOpen, History, LogOut } from "lucide-react";
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
      <header className="sticky top-0 z-30 border-b border-[#dde0d4] bg-[#faf9f6]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d4a2b] shadow-sm shadow-[#2d4a2b]/20">
                <Leaf className="h-5 w-5 text-[#a4ac86]" />
              </div>
              <span className="text-base font-bold text-[#1e2d1c]" style={{ fontFamily: "var(--font-pt-serif)" }}>ALUMCO</span>
            </Link>

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#2d4a2b] text-white"
                        : "text-[#7d8471] hover:bg-[#f0f2eb] hover:text-[#1e2d1c]"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-[#a4ac86]" : "text-[#a4ac86]"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <SedeBadge sedeId="s1" sedeName="Concepción" size="md" />
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-[#f0f2eb]">
                <AvatarFallback className="bg-gradient-to-br from-[#f0f2eb] to-[#dde0d4] text-[#2d4a2b] text-sm font-semibold">
                  MG
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-[#1e2d1c]">María González</span>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#7d8471] hover:bg-[#f0f2eb] hover:text-[#1e2d1c] transition-colors"
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
