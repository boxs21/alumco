/** Centralized status configurations for trainings */
export const TRAINING_STATUS_CONFIG = {
  DRAFT: {
    label: "Borrador",
    className: "bg-[#f0f2eb] text-[#6b7260] hover:bg-[#f0f2eb]",
    barColor: "bg-gradient-to-r from-[#dde0d4] to-[#a4ac86]",
  },
  PUBLISHED: {
    label: "Publicado",
    className: "bg-[#f0f2eb] text-[#4a7c59] hover:bg-[#f0f2eb]",
    barColor: "bg-gradient-to-r from-[#4a7c59] to-[#a4ac86]",
  },
  ARCHIVED: {
    label: "Archivado",
    className: "bg-[#fdf0ec] text-[#b74729] hover:bg-[#fdf0ec]",
    barColor: "bg-gradient-to-r from-[#b74729] to-[#d4826a]",
  },
} as const;

export const COLLABORATOR_STATUS_CONFIG = {
  COMPLETED: {
    label: "Completado",
    className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  },
  IN_PROGRESS: {
    label: "En progreso",
    className: "bg-amber-50 text-amber-700 hover:bg-amber-50",
  },
} as const;

/** Forest Canopy theme tokens for use in components */
export const theme = {
  colors: {
    forest: "#2d4a2b",
    forestHover: "#4a7c59",
    forestLight: "#f0f2eb",
    olive: "#a4ac86",
    sage: "#6b7260",
    ivory: "#faf9f6",
    text: "#1e2d1c",
    border: "#dde0d4",
    success: "#4a7c59",
    warning: "#f9a620",
    danger: "#b74729",
  },
  sede: {
    concepcion: { color: "#2d4a2b", bg: "#f0f2eb" },
    coyhaique: { color: "#f9a620", bg: "#fdf6e3" },
    global: { color: "#6b7260", bg: "#f0f2eb" },
  },
} as const;

/** Default sede filter tabs */
export const SEDE_FILTER_OPTIONS = [
  { key: "ALL", label: "Todas" },
  { key: "CONCEPCION", label: "Concepción" },
  { key: "COYHAIQUE", label: "Coyhaique" },
] as const;
