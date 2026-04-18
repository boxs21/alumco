"use client";

import { Bell, Settings, Search } from "lucide-react";
import type { ReactNode } from "react";

interface TopbarProps {
  title?: ReactNode;
  sub?: string;
  right?: ReactNode;
}

export default function Topbar({ title, sub, right }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-end justify-between border-b border-[#e8e4dc] bg-[#f6f3ee]/95 backdrop-blur-sm px-6 py-5 gap-4 flex-wrap">
      <div>
        {title && (
          <h1 className="text-[26px] font-[800] leading-none tracking-[-0.025em] text-[#15182b]">
            {title}
          </h1>
        )}
        {sub && (
          <p className="mt-1.5 text-[13px] text-[#6b7185]">{sub}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 bg-white border border-[#e8e4dc] px-3 py-[7px] rounded-full min-w-[260px] text-[#a5a9b8]">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <input
            className="flex-1 bg-transparent border-0 outline-none text-[12.5px] text-[#15182b] placeholder:text-[#a5a9b8]"
            placeholder="Buscar capacitaciones, personas…"
          />
        </div>

        {/* Bell */}
        <button
          className="relative w-9 h-9 bg-white border border-[#e8e4dc] text-[#6b7185] rounded-[10px] grid place-items-center hover:bg-[#f7f5f0] hover:text-[#15182b] transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-[#ff7c6b] rounded-full border-2 border-white" />
        </button>

        {/* Settings */}
        <button
          className="w-9 h-9 bg-white border border-[#e8e4dc] text-[#6b7185] rounded-[10px] grid place-items-center hover:bg-[#f7f5f0] hover:text-[#15182b] transition-colors"
          aria-label="Configuración"
        >
          <Settings className="h-4 w-4" />
        </button>

        {right}
      </div>
    </header>
  );
}
