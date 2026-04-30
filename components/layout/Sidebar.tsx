"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  LogOut,
  UserCog,
} from "lucide-react";
import FontSizeSwitcher from "@/components/shared/FontSizeSwitcher";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

const allNavItems = [
  { label: "Dashboard",       href: "/admin/dashboard",       icon: LayoutDashboard, group: "general", adminOnly: false },
  { label: "Capacitaciones",  href: "/admin/capacitaciones",  icon: BookOpen,         group: "general", adminOnly: false },
  { label: "Colaboradores",   href: "/admin/colaboradores",   icon: Users,            group: "general", adminOnly: false },
  { label: "Reportes",        href: "/admin/reportes",        icon: BarChart3,        group: "general", adminOnly: false },
  { label: "Calendario",      href: "/admin/calendario",      icon: Calendar,         group: "general", adminOnly: false },
  { label: "Personal",        href: "/admin/personal",        icon: UserCog,          group: "equipo",  adminOnly: true },
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("Administrador");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name ?? user.email ?? "";
      setUserName(name);
      supabase.from("profiles").select("role, sede_id").eq("id", user.id).single().then(({ data }) => {
        if (!data) return;
        setIsAdmin(data.role === "ADMIN");
        const labelMap = {
          ADMIN: "Administrador",
          PROFESOR: "Profesor",
          COLLABORATOR: "Colaborador",
        };
        setUserRole(labelMap[data.role as keyof typeof labelMap] || "Usuario");
      });
    });
  }, []);

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);
  const generalItems = navItems.filter((i) => i.group === "general");
  const equipoItems = navItems.filter((i) => i.group === "equipo");
  const initials = userName ? getInitials(userName) : "--";
  const displayName = userName.split(" ").slice(0, 2).join(" ");

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[Sidebar] sign-out error:", error.message);
      setSigningOut(false);
      return;
    }
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-30 hidden lg:flex h-full w-64 flex-col border-r border-[#e8e4dc] bg-white">
      {/* Brand */}
      <div className="flex h-[64px] items-center px-5 border-b border-[#f0ece4]">
        <Image src="/logo.png" alt="ALUMCO" width={130} height={40} className="object-contain" priority />
      </div>

      {/* Navigation */}
      <nav aria-label="Navegación principal" className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-2.5 pb-2 text-[10px] font-[700] uppercase tracking-[0.14em] text-[#a5a9b8]">
          General
        </p>
        <div className="space-y-0.5">
          {generalItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-[10px] px-2.5 py-[9px] text-[13px] font-[500] transition-all duration-150 ${
                  isActive
                    ? "bg-[#2d4a8a] text-white font-[600] shadow-sm sidebar-active-indicator"
                    : "text-[#6b7185] hover:bg-[#f7f5f0] hover:text-[#15182b]"
                }`}
              >
                <item.icon
                  className={`h-[17px] w-[17px] flex-shrink-0 ${
                    isActive ? "text-[#a5c0f5]" : "text-[#a5a9b8]"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {equipoItems.length > 0 && (
          <>
            <p className="mt-4 px-2.5 pb-2 text-[10px] font-[700] uppercase tracking-[0.14em] text-[#a5a9b8]">
              Equipo
            </p>
            <div className="space-y-0.5">
              {equipoItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-[10px] px-2.5 py-[9px] text-[13px] font-[500] transition-all duration-150 ${
                      isActive
                        ? "bg-[#2d4a8a] text-white font-[600] shadow-sm sidebar-active-indicator"
                        : "text-[#6b7185] hover:bg-[#f7f5f0] hover:text-[#15182b]"
                    }`}
                  >
                    <item.icon
                      className={`h-[17px] w-[17px] flex-shrink-0 ${
                        isActive ? "text-[#a5c0f5]" : "text-[#a5a9b8]"
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <div className="h-px bg-[#f0ece4] mb-3" />

        {/* User info */}
        {userName && (
          <div className="flex items-center gap-2.5 px-2 py-2.5 mb-1">
            <div className="w-9 h-9 rounded-[12px] bg-[#ff7c6b] text-white grid place-items-center text-[12px] font-[700] shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[12.5px] font-[700] text-[#15182b] truncate">{displayName}</div>
              <div className="text-[10.5px] text-[#6b7185]">{userRole}</div>
            </div>
          </div>
        )}

        <FontSizeSwitcher />
        <div className="mt-1.5" />
        <div className="mt-1" />
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-[9px] text-[13px] font-[500] text-[#a5a9b8] hover:bg-[#f7f5f0] hover:text-[#6b7185] transition-all duration-150 disabled:opacity-50"
        >
          <LogOut className="h-[17px] w-[17px] flex-shrink-0" />
          {signingOut ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}
