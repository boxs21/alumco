"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  LogOut,
  Leaf,
} from "lucide-react";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import FontSizeSwitcher from "@/components/shared/FontSizeSwitcher";
import { createClient } from "@/lib/supabase";

const navItems = [
  { label: "Dashboard",       href: "/admin/dashboard",       icon: LayoutDashboard },
  { label: "Capacitaciones",  href: "/admin/capacitaciones",  icon: BookOpen },
  { label: "Colaboradores",   href: "/admin/colaboradores",   icon: Users },
  { label: "Reportes",        href: "/admin/reportes",        icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-30 hidden lg:flex h-full w-64 flex-col border-r border-[#dde0d4] bg-[#faf9f6]">
      {/* Subtle dot pattern overlay */}
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-20" />

      {/* Logo */}
      <div className="relative flex h-16 items-center gap-3 px-6 border-b border-[#dde0d4]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2d4a2b] shadow-sm shadow-[#2d4a2b]/30">
          <Leaf className="h-5 w-5 text-[#a4ac86]" />
        </div>
        <div>
          <p className="text-base font-bold text-[#1e2d1c] leading-tight tracking-tight" style={{ fontFamily: "var(--font-pt-serif)" }}>ALUMCO</p>
          <p className="text-[11px] text-[#7d8471] font-medium uppercase tracking-widest">Capacitaci&oacute;n</p>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Navegación principal" className="relative flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 animate-slide-in-left ${
                isActive
                  ? "bg-[#2d4a2b] text-white sidebar-active-indicator shadow-sm shadow-[#2d4a2b]/20"
                  : "text-[#7d8471] hover:bg-[#f0f2eb] hover:text-[#1e2d1c]"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <item.icon
                className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${
                  isActive ? "text-[#a4ac86]" : "text-[#a4ac86]"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative px-3 pb-5">
        <div className="h-px bg-gradient-to-r from-transparent via-[#dde0d4] to-transparent mb-3" />

        {/* Font Size Switcher */}
        <FontSizeSwitcher />

        <div className="mt-2" />

        {/* Theme Switcher */}
        <ThemeSwitcher />

        <div className="mt-1" />

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#a4ac86] hover:bg-[#f0f2eb] hover:text-[#7d8471] transition-all duration-200"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          Cerrar sesi&oacute;n
        </button>
      </div>
    </aside>
  );
}
