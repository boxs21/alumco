"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, BarChart3, Calendar, LogOut, UserCog } from "lucide-react";
import { createClient } from "@/lib/supabase";

const allNavItems = [
  { label: "Dashboard",      shortLabel: "Dashboard", href: "/admin/dashboard",      icon: LayoutDashboard, adminOnly: false },
  { label: "Capacitaciones", shortLabel: "Capac.",    href: "/admin/capacitaciones", icon: BookOpen,         adminOnly: false },
  { label: "Colaboradores",  shortLabel: "Colab.",    href: "/admin/colaboradores",  icon: Users,            adminOnly: false },
  { label: "Reportes",       shortLabel: "Reportes",  href: "/admin/reportes",       icon: BarChart3,        adminOnly: false },
  { label: "Calendario",     shortLabel: "Agenda",    href: "/admin/calendario",     icon: Calendar,         adminOnly: false },
  { label: "Personal",       shortLabel: "Personal",  href: "/admin/personal",       icon: UserCog,          adminOnly: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("role").eq("id", user.id).single().then(({ data }) => {
        setIsAdmin(data?.role === "ADMIN");
      });
    });
  }, []);

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[BottomNav] sign-out error:", error.message);
      setSigningOut(false);
      return;
    }
    router.push("/login");
  }

  return (
    <nav aria-label="Navegación principal móvil" className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden border-t border-[#e8e4dc] bg-white/95 backdrop-blur-sm">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
              isActive ? "text-[#2d4a8a]" : "text-[#a5a9b8] hover:text-[#6b7185]"
            }`}
          >
            <item.icon
              className={`h-[22px] w-[22px] ${isActive ? "text-[#2d4a8a]" : "text-[#a5a9b8]"}`}
            />
            <span className="text-[10px] font-[600] leading-none">{item.shortLabel}</span>
          </Link>
        );
      })}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[#a5a9b8] hover:text-[#6b7185] transition-colors disabled:opacity-50"
        aria-label="Cerrar sesión"
      >
        <LogOut className="h-[22px] w-[22px]" />
        <span className="text-[10px] font-[600] leading-none">{signingOut ? "..." : "Salir"}</span>
      </button>
    </nav>
  );
}
