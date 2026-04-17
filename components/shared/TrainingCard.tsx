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
  DRAFT:     { label: "Borrador",  className: "bg-[#EEF2FF] text-[#6B7AB0] hover:bg-[#EEF2FF]" },
  PUBLISHED: { label: "Publicado", className: "bg-[#EEF2FF] text-[#2B4BA8] hover:bg-[#EEF2FF]" },
  ARCHIVED:  { label: "Archivado", className: "bg-[#FEF0F2] text-[#E8445A] hover:bg-[#FEF0F2]" },
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
      <Card className="border-[#C8D4EC]/80 shadow-sm card-hover h-full overflow-hidden">
        <div className={`h-[2px] ${
          status === "PUBLISHED" ? "bg-[#2B4BA8]" :
          status === "DRAFT" ? "bg-[#C8D4EC]" :
          "bg-[#E8445A]"
        } opacity-70`} />
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
              {status === "DRAFT" ? (
                <FileEdit className="h-5 w-5 text-[#4A5C8A]" />
              ) : (
                <BookOpen className="h-5 w-5 text-[#2B4BA8]" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
              {onDelete && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-[#8A9BC8] hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Eliminar capacitación"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#1A2F6B] leading-tight group-hover:text-[#2B4BA8] transition-colors duration-200">
              {title}
            </h3>
            <p className="text-sm text-[#6B7AB0] mt-1">&Aacute;rea: {area}</p>
          </div>

          <div className="flex items-center gap-2">
            <SedeBadge sedeId={sedeId} sedeName={sedeName} size="sm" />
          </div>

          {asignados > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7AB0]">Cumplimiento</span>
                <span className="font-semibold text-[#1A2F6B]">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EEF2FF]">
                <div
                  className="h-2 rounded-full bg-[#2B4BA8] animate-progress"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-[#4A5C8A]">
                {completados} de {asignados} completados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
