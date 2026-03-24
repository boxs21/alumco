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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold text-slate-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedSede} onValueChange={onSedeChange}>
          <SelectTrigger className="w-48 h-10 text-sm">
            <SelectValue placeholder="Seleccionar sede" />
          </SelectTrigger>
          <SelectContent>
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

        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-medium">
              VL
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-900 leading-tight">Valentina Lagos</p>
            <p className="text-xs text-slate-500">Administradora</p>
          </div>
        </div>
      </div>
    </header>
  );
}
