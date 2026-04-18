"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BookOpen, History, LogOut, CalendarDays } from "lucide-react";
import Image from "next/image";
import DarkModeToggle from "@/components/shared/DarkModeToggle";
import FontSizeSwitcher from "@/components/shared/FontSizeSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Mis capacitaciones", shortLabel: "Capac.", href: "/portal", icon: BookOpen },
  { label: "Historial", shortLabel: "Historial", href: "/portal/historial", icon: History },
  { label: "Calendario", shortLabel: "Agenda", href: "/portal/calendario", icon: CalendarDays },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("·");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name =
        (user.user_metadata?.full_name as string | undefined) ??
        user.email ??
        "Usuario";
      setUserName(name);
      setUserInitials(getInitials(name));
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#f6f3ee]">
      <header className="sticky top-0 z-30 border-b border-[#e8e4dc] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl flex h-14 lg:h-16 items-center justify-between px-4 lg:px-6">
          {/* Left: logo mark + nav */}
          <div className="flex items-center gap-3 lg:gap-6">
            <Link href="/portal" aria-label="ALUMCO — inicio">
              <Image src="/logo.png" alt="ALUMCO" width={110} height={34} className="object-contain" priority />
            </Link>

            <nav aria-label="Navegación portal" className="hidden sm:flex items-center gap-0.5 ml-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-[11px] text-[13.5px] font-[600] transition-colors ${
                      isActive
                        ? "bg-[#eaf0fb] text-[#2d4a8a]"
                        : "text-[#6b7185] hover:bg-[#f7f5f0] hover:text-[#15182b]"
                    }`}
                  >
                    <item.icon className={`h-[15px] w-[15px] ${isActive ? "text-[#2d4a8a]" : "text-[#a5a9b8]"}`} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: settings + user + logout */}
          <div className="flex items-center gap-1 lg:gap-2">
            <FontSizeSwitcher compact />
            <DarkModeToggle compact />

            <div className="w-px h-5 bg-[#e8e4dc] mx-1 hidden sm:block" aria-hidden="true" />

            <div className="hidden sm:flex items-center gap-2 bg-[#f7f5f0] rounded-full pl-1 pr-3.5 py-1">
              <Avatar className="h-7 w-7 lg:h-7 lg:w-7">
                <AvatarFallback className="bg-[#ff7c6b] text-white text-[10px] font-[700] rounded-full">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {userName && (
                <span className="hidden lg:block text-[13px] font-[600] text-[#15182b] max-w-[120px] truncate">
                  {userName}
                </span>
              )}
            </div>

            <button
              onClick={handleSignOut}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex items-center justify-center h-8 w-8 rounded-[10px] text-[#a5a9b8] hover:bg-[#f7f5f0] hover:text-[#6b7185] transition-colors"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 lg:px-6 py-4 lg:py-6 pb-16 sm:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Navegación móvil"
        className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden border-t border-[#e8e4dc] bg-white/95 backdrop-blur-sm"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                isActive ? "text-[#2d4a8a]" : "text-[#a5a9b8]"
              }`}
            >
              <item.icon className={`h-[22px] w-[22px] ${isActive ? "text-[#2d4a8a]" : "text-[#a5a9b8]"}`} aria-hidden="true" />
              <span className="text-[10px] font-[600] leading-none">{item.shortLabel}</span>
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          aria-label="Cerrar sesión"
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[#a5a9b8]"
        >
          <LogOut className="h-[22px] w-[22px]" aria-hidden="true" />
          <span className="text-[10px] font-[600] leading-none">Salir</span>
        </button>
      </nav>
    </div>
  );
}
