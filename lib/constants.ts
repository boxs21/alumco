/** Centralized status configurations for trainings */
export const TRAINING_STATUS_CONFIG = {
  DRAFT: {
    label: "Borrador",
    className: "bg-[#EEF2FF] text-[#4A5C8A] hover:bg-[#EEF2FF]",
    barColor: "bg-gradient-to-r from-[#C8D4EC] to-[#8A9BC8]",
  },
  PUBLISHED: {
    label: "Publicado",
    className: "bg-[#EEF2FF] text-[#2B4BA8] hover:bg-[#EEF2FF]",
    barColor: "bg-gradient-to-r from-[#2B4BA8] to-[#8A9BC8]",
  },
  ARCHIVED: {
    label: "Archivado",
    className: "bg-[#FEF0F2] text-[#E8445A] hover:bg-[#FEF0F2]",
    barColor: "bg-gradient-to-r from-[#E8445A] to-[#F07080]",
  },
} as const;

export const COLLABORATOR_STATUS_CONFIG = {
  COMPLETED: {
    label: "Completado",
    className: "bg-[#EDFAE0] text-[#4D7A28] hover:bg-[#EDFAE0]",
  },
  IN_PROGRESS: {
    label: "En progreso",
    className: "bg-[#FEF5E7] text-[#A86A00] hover:bg-[#FEF5E7]",
  },
} as const;

/** Forest Canopy theme tokens for use in components */
export const theme = {
  colors: {
    forest: "#2B4BA8",
    forestHover: "#2B4BA8",
    forestLight: "#EEF2FF",
    olive: "#8A9BC8",
    sage: "#4A5C8A",
    ivory: "#FAFBFF",
    text: "#1A2F6B",
    border: "#C8D4EC",
    success: "#2B4BA8",
    warning: "#f9a620",
    danger: "#E8445A",
  },
  sede: {
    concepcion: { color: "#2B4BA8", bg: "#EEF2FF" },
    coyhaique: { color: "#f9a620", bg: "#fdf6e3" },
    global: { color: "#4A5C8A", bg: "#EEF2FF" },
  },
} as const;

/** Default sede filter tabs */
export const SEDE_FILTER_OPTIONS = [
  { key: "ALL", label: "Todas" },
  { key: "CONCEPCION", label: "Concepción" },
  { key: "COYHAIQUE", label: "Coyhaique" },
] as const;
