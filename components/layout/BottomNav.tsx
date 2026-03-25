"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, BarChart3 } from "lucide-react";

const navItems = [
  { label: "Dashboard",  shortLabel: "Dashboard",  href: "/admin/dashboard",      icon: LayoutDashboard },
  { label: "Capacitaciones", shortLabel: "Capac.",  href: "/admin/capacitaciones", icon: BookOpen },
  { label: "Colaboradores",  shortLabel: "Colab.",  href: "/admin/colaboradores",  icon: Users },
  { label: "Reportes",       shortLabel: "Reportes", href: "/admin/reportes",      icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden border-t border-[#dde0d4] bg-[#faf9f6]/95 backdrop-blur-sm">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
              isActive ? "text-[#2d4a2b]" : "text-[#a4ac86] hover:text-[#7d8471]"
            }`}
          >
            <item.icon
              className={`h-[22px] w-[22px] ${isActive ? "text-[#2d4a2b]" : "text-[#a4ac86]"}`}
            />
            <span className="text-[10px] font-medium leading-none">{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
