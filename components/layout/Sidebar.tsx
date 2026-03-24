"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  LogOut,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",       href: "/admin/dashboard",       icon: LayoutDashboard },
  { label: "Capacitaciones",  href: "/admin/capacitaciones",  icon: BookOpen },
  { label: "Colaboradores",   href: "/admin/colaboradores",   icon: Users },
  { label: "Reportes",        href: "/admin/reportes",        icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-[#dde0d4]/80 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-[#dde0d4]/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#2d4a2b] to-[#4a7c59] shadow-sm shadow-[#2d4a2b]/20">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-base font-bold text-[#1e2d1c] leading-tight tracking-tight">ALUMCO</p>
          <p className="text-xs text-[#7d8471] font-medium">Capacitaci&oacute;n</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 animate-slide-in-left ${
                isActive
                  ? "bg-[#f0f2eb] text-[#2d4a2b] sidebar-active-indicator shadow-sm shadow-[#2d4a2b]/[0.06]"
                  : "text-[#7d8471] hover:bg-[#f0f2eb]/60 hover:text-[#1e2d1c]"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-[#2d4a2b]" : "text-[#a4ac86]"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#dde0d4] to-transparent mb-3" />
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#a4ac86] hover:bg-[#f0f2eb]/60 hover:text-[#7d8471] transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesi&oacute;n
        </Link>
      </div>
    </aside>
  );
}
