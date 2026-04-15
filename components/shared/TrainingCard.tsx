import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SedeBadge from "./SedeBadge";
import { BookOpen, FileEdit, Trash2 } from "lucide-react";
import Link from "next/link";

interface TrainingCardProps {
  id: string;
  title: string;
  area: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sedeId: string | null;
  sedeName: string | null;
  completados: number;
  asignados: number;
  href?: string;
  delay?: number;
  onDelete?: () => void;
}

const statusConfig = {
  DRAFT:     { label: "Borrador",  className: "bg-[#f0f2eb] text-[#7d8471] hover:bg-[#f0f2eb]" },
  PUBLISHED: { label: "Publicado", className: "bg-[#f0f2eb] text-[#4a7c59] hover:bg-[#f0f2eb]" },
  ARCHIVED:  { label: "Archivado", className: "bg-[#fdf0ec] text-[#b74729] hover:bg-[#fdf0ec]" },
};

export default function TrainingCard({
  id,
  title,
  area,
  status,
  sedeId,
  sedeName,
  completados,
  asignados,
  href,
  delay = 0,
  onDelete,
}: TrainingCardProps) {
  const statusInfo = statusConfig[status];
  const progress = asignados > 0 ? Math.round((completados / asignados) * 100) : 0;
  const linkHref = href ?? `/admin/capacitaciones/${id}`;

  return (
    <Link
      href={linkHref}
      className="block group animate-fade-in-up"
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <Card className="border-[#dde0d4]/80 shadow-sm card-hover h-full overflow-hidden">
        <div className={`h-[2px] ${
          status === "PUBLISHED" ? "bg-[#4a7c59]" :
          status === "DRAFT" ? "bg-[#dde0d4]" :
          "bg-[#b74729]"
        } opacity-70`} />
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f2eb]">
              {status === "DRAFT" ? (
                <FileEdit className="h-5 w-5 text-[#6b7260]" />
              ) : (
                <BookOpen className="h-5 w-5 text-[#2d4a2b]" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
              {onDelete && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-[#a4ac86] hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Eliminar capacitación"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#1e2d1c] leading-tight group-hover:text-[#4a7c59] transition-colors duration-200">
              {title}
            </h3>
            <p className="text-sm text-[#7d8471] mt-1">&Aacute;rea: {area}</p>
          </div>

          <div className="flex items-center gap-2">
            <SedeBadge sedeId={sedeId} sedeName={sedeName} size="sm" />
          </div>

          {asignados > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#7d8471]">Cumplimiento</span>
                <span className="font-semibold text-[#1e2d1c]">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f0f2eb]">
                <div
                  className="h-2 rounded-full bg-[#2d4a2b] animate-progress"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-[#6b7260]">
                {completados} de {asignados} completados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
