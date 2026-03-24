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
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Dashboard",       href: "/admin/dashboard",       icon: LayoutDashboard },
  { label: "Capacitaciones",  href: "/admin/capacitaciones",  icon: BookOpen },
  { label: "Colaboradores",   href: "/admin/colaboradores",   icon: Users },
  { label: "Reportes",        href: "/admin/reportes",        icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900 leading-tight">ALUMCO</p>
          <p className="text-xs text-slate-500">Capacitación</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-500" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <Separator className="mb-3" />
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <LogOut className="h-5 w-5 text-slate-400" />
          Cerrar sesión
        </Link>
      </div>
    </aside>
  );
}
