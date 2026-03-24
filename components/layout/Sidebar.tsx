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
    <aside className="fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-slate-200/80 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm shadow-indigo-500/20">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900 leading-tight tracking-tight">ALUMCO</p>
          <p className="text-xs text-slate-400 font-medium">Capacitaci&oacute;n</p>
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
                  ? "bg-indigo-50 text-indigo-700 sidebar-active-indicator shadow-sm shadow-indigo-500/[0.06]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-indigo-500" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3" />
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesi&oacute;n
        </Link>
      </div>
    </aside>
  );
}
