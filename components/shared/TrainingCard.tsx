import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SedeBadge from "./SedeBadge";
import { BookOpen, FileEdit } from "lucide-react";
import Link from "next/link";

/** Props que recibe la tarjeta de capacitación */
interface TrainingCardProps {
  id: string;
  title: string;
  area: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sedeId: string | null;       // null significa que aplica a todas las sedes
  sedeName: string | null;
  completados: number;         // colaboradores que ya completaron esta capacitación
  asignados: number;           // total de colaboradores con esta capacitación asignada
  href?: string;               // URL de destino al hacer clic (por defecto: detalle de la capacitación)
  delay?: number;              // retraso de animación de entrada (en décimas de segundo)
}

/** Mapeo de estilos visuales según el estado de la capacitación */
const statusConfig = {
  DRAFT:     { label: "Borrador",  className: "bg-[#f0f2eb] text-[#7d8471] hover:bg-[#f0f2eb]" },
  PUBLISHED: { label: "Publicado", className: "bg-[#f0f2eb] text-[#4a7c59] hover:bg-[#f0f2eb]" },
  ARCHIVED:  { label: "Archivado", className: "bg-[#fdf0ec] text-[#b74729] hover:bg-[#fdf0ec]" },
};

/**
 * Tarjeta visual que muestra el resumen de una capacitación:
 * estado, área, sede, y barra de progreso de cumplimiento.
 */
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
  // Calcula el porcentaje de cumplimiento (0 si no hay asignados)
  const progress = asignados > 0 ? Math.round((completados / asignados) * 100) : 0;
  // Usa el href proporcionado o genera la URL del detalle de la capacitación
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
