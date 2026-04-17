"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, Calendar, LogOut } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import DarkModeToggle from "@/components/shared/DarkModeToggle";
import FontSizeSwitcher from "@/components/shared/FontSizeSwitcher";
import { Toaster } from "sonner";

const navItems = [
  { label: "Dashboard",      shortLabel: "Dashboard", href: "/profesor/dashboard",      icon: LayoutDashboard },
  { label: "Capacitaciones", shortLabel: "Capac.",    href: "/profesor/capacitaciones", icon: BookOpen },
  { label: "Calendario",     shortLabel: "Agenda",    href: "/profesor/calendario",     icon: Calendar },
];

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-30 hidden lg:flex h-full w-64 flex-col border-r border-[#C8D4EC] bg-[#FAFBFF]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-20" />

      <div className="relative flex h-16 items-center px-5 border-b border-[#C8D4EC]">
        <Image src="/logo.png" alt="ALUMCO" width={130} height={40} className="object-contain" priority />
      </div>

      <nav aria-label="Navegación principal" className="relative flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 animate-slide-in-left ${
                isActive
                  ? "bg-[#2B4BA8] text-white sidebar-active-indicator shadow-sm shadow-[#2B4BA8]/20"
                  : "text-[#6B7AB0] hover:bg-[#EEF2FF] hover:text-[#1A2F6B]"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0 text-[#8A9BC8]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative px-3 pb-5">
        <div className="h-px bg-gradient-to-r from-transparent via-[#C8D4EC] to-transparent mb-3" />
        <FontSizeSwitcher />
        <div className="mt-2" />
        <DarkModeToggle />
        <div className="mt-1" />
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#8A9BC8] hover:bg-[#EEF2FF] hover:text-[#6B7AB0] transition-all duration-200 disabled:opacity-50"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {signingOut ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav aria-label="Navegación móvil" className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden border-t border-[#C8D4EC] bg-[#FAFBFF]/95 backdrop-blur-sm">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
              isActive ? "text-[#2B4BA8]" : "text-[#8A9BC8] hover:text-[#6B7AB0]"
            }`}
          >
            <item.icon className={`h-[22px] w-[22px] ${isActive ? "text-[#2B4BA8]" : "text-[#8A9BC8]"}`} />
            <span className="text-[10px] font-medium leading-none">{item.shortLabel}</span>
          </Link>
        );
      })}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[#8A9BC8] hover:text-[#6B7AB0] transition-colors disabled:opacity-50"
      >
        <LogOut className="h-[22px] w-[22px]" />
        <span className="text-[10px] font-medium leading-none">{signingOut ? "..." : "Salir"}</span>
      </button>
    </nav>
  );
}

export default function ProfesorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFBFF]">
      <Sidebar />
      <main className="lg:ml-64 pb-16 lg:pb-0">{children}</main>
      <BottomNav />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
