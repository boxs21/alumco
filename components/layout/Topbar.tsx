"use client";

import { useEffect, useState } from "react";
import { SEDES } from "@/lib/config";
import { createClient } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ThemeSwitcher from "@/components/shared/ThemeSwitcher";
import FontSizeSwitcher from "@/components/shared/FontSizeSwitcher";

interface TopbarProps {
  selectedSede: string;
  onSedeChange: (sede: string) => void;
  title?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Topbar({ selectedSede, onSedeChange, title }: TopbarProps) {
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("--");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name ?? user.email ?? "Usuario";
      setUserName(name);
      setUserInitials(getInitials(name));
    });
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 lg:h-16 items-center justify-between border-b border-[#dde0d4]/80 bg-[#faf9f6]/95 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg lg:text-xl font-semibold text-[#1e2d1c] tracking-tight animate-fade-in">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Font size + Theme switcher — compact on mobile, hidden on lg (they're in sidebar) */}
        <div className="lg:hidden flex items-center gap-1.5">
          <FontSizeSwitcher compact />
          <ThemeSwitcher compact />
        </div>

        {/* Sede selector */}
        <div className="hidden sm:block">
          <Select value={selectedSede} onValueChange={onSedeChange}>
            <SelectTrigger className="w-36 lg:w-48 h-9 lg:h-10 text-sm rounded-xl border-[#dde0d4]">
              <SelectValue placeholder="Sede" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="global">Todas las sedes</SelectItem>
              <SelectItem value="CONCEPCION">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#2d4a2b]" />
                  {SEDES.CONCEPCION.nombre}
                </span>
              </SelectItem>
              <SelectItem value="COYHAIQUE">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#f9a620]" />
                  {SEDES.COYHAIQUE.nombre}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:block h-6 w-px bg-[#dde0d4]" />

        <div className="flex items-center gap-2 lg:gap-3">
          <Avatar className="h-8 w-8 lg:h-9 lg:w-9 ring-2 ring-[#f0f2eb]">
            <AvatarFallback className="bg-[#f0f2eb] text-[#2d4a2b] text-xs lg:text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-[#1e2d1c] leading-tight">{userName || "—"}</p>
            <p className="text-xs text-[#a4ac86]">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
