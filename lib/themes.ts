export interface ThemeColors {
  primary: string;
  primaryHover: string;
  foreground: string;
  background: string;
  secondary: string;
  mutedForeground: string;
  accent: string;
  /** Icon / decorative accent — must be visible on both `background` and `primary` */
  iconAccent: string;
  border: string;
  cardBg: string;
  sedeConcepcion: string;
  sedeConcepcionBg: string;
  sedeCoyhaique: string;
  sedeCoyhaiqueBg: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  dark?: boolean;
  colors: ThemeColors;
  preview: [string, string, string, string];
}

export const themes: Theme[] = [
  {
    id: "airtable-light",
    name: "Claro",
    description: "Modo claro — Airtable design system",
    colors: {
      primary:          "#1b61c9",
      primaryHover:     "#254fad",
      foreground:       "#181d26",
      background:       "#ffffff",
      secondary:        "#f8fafc",
      mutedForeground:  "rgba(4,14,32,0.65)",
      accent:           "#eff6ff",
      iconAccent:       "#7ba3d6",
      border:           "#e0e2e6",
      cardBg:           "#ffffff",
      sedeConcepcion:    "#1b61c9",
      sedeConcepcionBg:  "#eff6ff",
      sedeCoyhaique:     "#f59e0b",
      sedeCoyhaiqueBg:   "#fef3c7",
    },
    preview: ["#ffffff", "#1b61c9", "#181d26", "#f8fafc"],
  },
  {
    id: "airtable-dark",
    name: "Oscuro",
    description: "Modo oscuro — Airtable design system",
    dark: true,
    colors: {
      primary:          "#4d8ef9",
      primaryHover:     "#6ba3fb",
      foreground:       "#e4e6eb",
      background:       "#0f1117",
      secondary:        "#161921",
      mutedForeground:  "rgba(228,230,235,0.65)",
      accent:           "#1c2340",
      iconAccent:       "rgba(228,230,235,0.45)",
      border:           "#2a2d3a",
      cardBg:           "#161921",
      sedeConcepcion:    "#4d8ef9",
      sedeConcepcionBg:  "#1c2340",
      sedeCoyhaique:     "#f59e0b",
      sedeCoyhaiqueBg:   "#2a2010",
    },
    preview: ["#0f1117", "#4d8ef9", "#1a1d27", "#e4e6eb"],
  },
];

export const DEFAULT_THEME = "airtable-light";

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
