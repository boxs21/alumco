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

type ColorScheme = "navy" | "coral" | "mustard" | "green";

const AREA_SCHEME: Record<string, ColorScheme> = {
  "Cuidado":        "coral",
  "Enfermería":     "green",
  "Administración": "mustard",
};

function areaScheme(area: string | null | undefined): ColorScheme {
  if (!area) return "green";
  return AREA_SCHEME[area] ?? "green";
}

const schemeConfig: Record<ColorScheme, {
  soft: string;
  blob: string;
  blobSmall: string;
  bar: string;
  icon: string;
}> = {
  navy:    { soft: "#eaf0fb", blob: "#2d4a8a", blobSmall: "#ff7c6b",  bar: "bg-[#2d4a8a]",  icon: "text-[#2d4a8a]"  },
  coral:   { soft: "#ffe6e1", blob: "#ff7c6b", blobSmall: "#f2b544",  bar: "bg-[#ff7c6b]",  icon: "text-[#e86154]"  },
  mustard: { soft: "#fdf1d8", blob: "#f2b544", blobSmall: "#2d4a8a",  bar: "bg-[#f2b544]",  icon: "text-[#8a6410]"  },
  green:   { soft: "#dbeee3", blob: "#3c9d70", blobSmall: "#f2b544",  bar: "bg-[#3c9d70]",  icon: "text-[#1a6a43]"  },
};

const statusConfig = {
  DRAFT:     { label: "Borrador",  className: "bg-white/80 text-[#6b7185] border-[#e8e4dc]" },
  PUBLISHED: { label: "Publicado", className: "bg-white/80 text-[#2d4a8a] border-[#c3d5f4]" },
  ARCHIVED:  { label: "Archivado", className: "bg-white/80 text-[#e86154] border-[#ffccc5]" },
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
  const scheme = areaScheme(area);
  const s = schemeConfig[scheme];
  const statusInfo = statusConfig[status];
  const progress = asignados > 0 ? Math.round((completados / asignados) * 100) : 0;
  const linkHref = href ?? `/admin/capacitaciones/${id}`;

  return (
    <Link
      href={linkHref}
      className="block group animate-fade-in-up"
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <Card className="border-[#e8e4dc] shadow-sm card-hover h-full overflow-hidden">
        {/* Colored header section */}
        <div
          className="relative overflow-hidden"
          style={{ background: s.soft, minHeight: 100, padding: "16px 18px 14px" }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute right-[-28px] bottom-[-28px] rounded-full pointer-events-none"
            style={{ width: 110, height: 110, background: s.blob, opacity: 0.13 }}
          />
          <svg
            viewBox="0 0 50 50"
            width="40"
            height="40"
            aria-hidden="true"
            className="absolute right-4 bottom-3 opacity-90"
          >
            <circle cx="25" cy="25" r="20" fill={s.blob} opacity="0.18" />
            <circle cx="31" cy="22" r="11" fill={s.blob} />
          </svg>

          {/* Badges row */}
          <div className="flex items-center gap-1.5 flex-wrap relative z-10">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-[600] border ${statusInfo.className}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              {statusInfo.label}
            </span>
            {onDelete && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                className="ml-auto h-6 w-6 flex items-center justify-center rounded-lg text-[#a5a9b8] hover:text-red-500 hover:bg-red-50 transition-colors"
                aria-label="Eliminar capacitación"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Icon */}
          <div className="mt-3 relative z-10">
            {status === "DRAFT" ? (
              <FileEdit className={`h-6 w-6 ${s.icon}`} aria-hidden="true" />
            ) : (
              <BookOpen className={`h-6 w-6 ${s.icon}`} aria-hidden="true" />
            )}
          </div>
        </div>

        <CardContent className="p-4 flex flex-col gap-3">
          <div>
            <h3 className="text-[14px] font-[700] text-[#15182b] leading-snug tracking-[-0.01em] group-hover:text-[#2d4a8a] transition-colors duration-200 min-h-[40px]">
              {title}
            </h3>
            <p className="text-[11.5px] text-[#6b7185] mt-1">{area}</p>
          </div>

          <SedeBadge sedeId={sedeId} sedeName={sedeName} size="sm" />

          {asignados > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#6b7185]">Cumplimiento</span>
                <span className="font-[700] text-[#15182b]">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f0ece4] overflow-hidden">
                <div
                  className={`h-2 rounded-full ${s.bar}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-[#6b7185]">{completados} de {asignados} completados</p>
            </div>
          ) : (
            <p className="text-[11.5px] text-[#a5a9b8] italic">Sin asignaciones aún</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
