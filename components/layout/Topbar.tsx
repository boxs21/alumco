"use client";

import { SEDES } from "@/lib/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopbarProps {
  selectedSede: string;
  onSedeChange: (sede: string) => void;
  title?: string;
}

export default function Topbar({ selectedSede, onSedeChange, title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-sm px-6">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight animate-fade-in">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedSede} onValueChange={onSedeChange}>
          <SelectTrigger className="w-48 h-10 text-sm rounded-xl border-slate-200">
            <SelectValue placeholder="Seleccionar sede" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="global">Todas las sedes</SelectItem>
            <SelectItem value="CONCEPCION">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                {SEDES.CONCEPCION.nombre}
              </span>
            </SelectItem>
            <SelectItem value="COYHAIQUE">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {SEDES.COYHAIQUE.nombre}
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-indigo-100">
            <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 text-sm font-semibold">
              VL
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-900 leading-tight">Valentina Lagos</p>
            <p className="text-xs text-slate-400">Administradora</p>
          </div>
        </div>
      </div>
    </header>
  );
}
