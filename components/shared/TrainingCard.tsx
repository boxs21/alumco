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
}

const statusConfig = {
  DRAFT:     { label: "Borrador",  className: "bg-slate-100 text-slate-600 hover:bg-slate-100" },
  PUBLISHED: { label: "Publicado", className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" },
  ARCHIVED:  { label: "Archivado", className: "bg-red-50 text-red-600 hover:bg-red-50" },
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
}: TrainingCardProps) {
  const statusInfo = statusConfig[status];
  const progress = asignados > 0 ? Math.round((completados / asignados) * 100) : 0;
  const linkHref = href ?? `/admin/capacitaciones/${id}`;

  return (
    <Link href={linkHref} className="block group">
      <Card className="border-slate-200 shadow-sm transition-shadow group-hover:shadow-md h-full">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              {status === "DRAFT" ? (
                <FileEdit className="h-5 w-5 text-indigo-500" />
              ) : (
                <BookOpen className="h-5 w-5 text-indigo-500" />
              )}
            </div>
            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Área: {area}</p>
          </div>

          <div className="flex items-center gap-2">
            <SedeBadge sedeId={sedeId} sedeName={sedeName} size="sm" />
          </div>

          {asignados > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Cumplimiento</span>
                <span className="font-medium text-slate-700">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                {completados} de {asignados} completados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
