/** Configuración centralizada de estados para las capacitaciones */
export const TRAINING_STATUS_CONFIG = {
  // Borrador: capacitación aún no publicada
  DRAFT: {
    label: "Borrador",
    className: "bg-[#f0f2eb] text-[#6b7260] hover:bg-[#f0f2eb]",
    barColor: "bg-gradient-to-r from-[#dde0d4] to-[#a4ac86]",
  },
  // Publicado: visible y asignable a colaboradores
  PUBLISHED: {
    label: "Publicado",
    className: "bg-[#f0f2eb] text-[#4a7c59] hover:bg-[#f0f2eb]",
    barColor: "bg-gradient-to-r from-[#4a7c59] to-[#a4ac86]",
  },
  // Archivado: ya no está activa
  ARCHIVED: {
    label: "Archivado",
    className: "bg-[#fdf0ec] text-[#b74729] hover:bg-[#fdf0ec]",
    barColor: "bg-gradient-to-r from-[#b74729] to-[#d4826a]",
  },
} as const;

/** Configuración de estados para el progreso de cada colaborador */
export const COLLABORATOR_STATUS_CONFIG = {
  // El colaborador ya completó la capacitación
  COMPLETED: {
    label: "Completado",
    className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  },
  // El colaborador está en proceso de completar la capacitación
  IN_PROGRESS: {
    label: "En progreso",
    className: "bg-amber-50 text-amber-700 hover:bg-amber-50",
  },
} as const;

/** Tokens de color del tema principal (Forest Canopy) usados en componentes */
export const theme = {
  colors: {
    forest: "#2d4a2b",        // color primario verde bosque
    forestHover: "#4a7c59",   // color al pasar el cursor
    forestLight: "#f0f2eb",   // fondo claro
    olive: "#a4ac86",         // acento oliva
    sage: "#6b7260",          // texto secundario
    ivory: "#faf9f6",         // fondo principal
    text: "#1e2d1c",          // texto principal
    border: "#dde0d4",        // bordes
    success: "#4a7c59",       // color de éxito
    warning: "#f9a620",       // color de advertencia
    danger: "#b74729",        // color de peligro/error
  },
  sede: {
    // Colores específicos por sede
    concepcion: { color: "#2d4a2b", bg: "#f0f2eb" },
    coyhaique: { color: "#f9a620", bg: "#fdf6e3" },
    global: { color: "#6b7260", bg: "#f0f2eb" },
  },
} as const;

/** Opciones del filtro por sede en las vistas de lista */
export const SEDE_FILTER_OPTIONS = [
  { key: "ALL", label: "Todas" },
  { key: "CONCEPCION", label: "Concepción" },
  { key: "COYHAIQUE", label: "Coyhaique" },
] as const;
