"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Leaf, BookOpen, History, LogOut, CalendarDays } from "lucide-react";
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
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="sticky top-0 z-30 border-b border-[#dde0d4] bg-[#faf9f6]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl flex h-14 lg:h-16 items-center justify-between px-4 lg:px-6">
          {/* Left: logo + nav */}
          <div className="flex items-center gap-3 lg:gap-6">
            <Link href="/portal" className="flex items-center gap-2" aria-label="ALUMCO — inicio">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d4a2b]">
                <Leaf className="h-4 w-4 text-[#a4ac86]" aria-hidden="true" />
              </div>
              <span
                className="text-sm lg:text-base font-bold text-[#1e2d1c]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                ALUMCO
              </span>
            </Link>

            <nav aria-label="Navegación portal" className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#2d4a2b] text-white"
                        : "text-[#7d8471] hover:bg-[#f0f2eb] hover:text-[#1e2d1c]"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-[#a4ac86]" : "text-[#a4ac86]"}`} aria-hidden="true" />
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

            <div className="w-px h-5 bg-[#dde0d4] mx-1 hidden sm:block" aria-hidden="true" />

            {/* User avatar + name — only on sm+ */}
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="h-7 w-7 lg:h-8 lg:w-8">
                <AvatarFallback className="bg-[#f0f2eb] text-[#2d4a2b] text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {userName && (
                <span className="hidden lg:block text-sm font-medium text-[#1e2d1c] max-w-[120px] truncate">
                  {userName}
                </span>
              )}
            </div>

            <button
              onClick={handleSignOut}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-[#7d8471] hover:bg-[#f0f2eb] hover:text-[#1e2d1c] transition-colors"
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
        className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden border-t border-[#dde0d4] bg-[#faf9f6]/95 backdrop-blur-sm"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                isActive ? "text-[#2d4a2b]" : "text-[#a4ac86]"
              }`}
            >
              <item.icon className={`h-[22px] w-[22px] ${isActive ? "text-[#2d4a2b]" : "text-[#a4ac86]"}`} aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">{item.shortLabel}</span>
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          aria-label="Cerrar sesión"
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[#a4ac86]"
        >
          <LogOut className="h-[22px] w-[22px]" aria-hidden="true" />
          <span className="text-[10px] font-medium leading-none">Salir</span>
        </button>
      </nav>
    </div>
  );
}
