import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SedeBadge from "./SedeBadge";
import { BookOpen, FileEdit } from "lucide-react";
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
          status === "PUBLISHED" ? "bg-gradient-to-r from-[#4a7c59] to-[#a4ac86]" :
          status === "DRAFT" ? "bg-gradient-to-r from-[#dde0d4] to-[#a4ac86]" :
          "bg-gradient-to-r from-[#b74729] to-[#d4826a]"
        } opacity-70`} />
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              status === "DRAFT" ? "bg-[#f0f2eb]" : "bg-[#f0f2eb]"
            }`}>
              {status === "DRAFT" ? (
                <FileEdit className="h-5 w-5 text-[#6b7260]" />
              ) : (
                <BookOpen className="h-5 w-5 text-[#2d4a2b]" />
              )}
            </div>
            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
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
                  className="h-2 rounded-full bg-gradient-to-r from-[#2d4a2b] to-[#4a7c59] animate-progress"
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
