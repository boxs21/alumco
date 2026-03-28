import type { LucideIcon } from "lucide-react";

/** Props del componente de estado vacío */
interface EmptyStateProps {
  icon: LucideIcon;          // ícono representativo de la sección vacía
  title: string;             // título del mensaje
  description: string;       // descripción breve
  action?: React.ReactNode;  // acción opcional (ej: botón para crear)
}

/**
 * Componente de estado vacío genérico.
 * Se muestra cuando una lista o sección no tiene datos que mostrar.
 */
export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
