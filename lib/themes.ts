export interface ThemeColors {
  primary: string;
  primaryHover: string;
  foreground: string;
  background: string;
  secondary: string;
  mutedForeground: string;
  accent: string;
  border: string;
  /* Sidebar / card backgrounds */
  cardBg: string;
  /* Sede colors */
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
  preview: [string, string, string, string]; // 4 swatch colors for preview
}

export const themes: Theme[] = [
  {
    id: "forest-canopy",
    name: "Forest Canopy",
    description: "Natural y orgánico, tonos de bosque",
    colors: {
      primary: "#2d4a2b",
      primaryHover: "#4a7c59",
      foreground: "#1e2d1c",
      background: "#faf9f6",
      secondary: "#f0f2eb",
      mutedForeground: "#6b7260",
      accent: "#a4ac86",
      border: "#dde0d4",
      cardBg: "#faf9f6",
      sedeConcepcion: "#2d4a2b",
      sedeConcepcionBg: "#f0f2eb",
      sedeCoyhaique: "#f9a620",
      sedeCoyhaiqueBg: "#fdf6e3",
    },
    preview: ["#2d4a2b", "#4a7c59", "#a4ac86", "#faf9f6"],
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    description: "Profesional y calmo, aguas profundas",
    colors: {
      primary: "#2d8b8b",
      primaryHover: "#3ba5a5",
      foreground: "#1a2332",
      background: "#f6fbfb",
      secondary: "#e4f1f1",
      mutedForeground: "#5a7a7a",
      accent: "#a8dadc",
      border: "#c5ddd8",
      cardBg: "#f6fbfb",
      sedeConcepcion: "#2d8b8b",
      sedeConcepcionBg: "#e4f1f1",
      sedeCoyhaique: "#f4a261",
      sedeCoyhaiqueBg: "#fef3e4",
    },
    preview: ["#1a2332", "#2d8b8b", "#a8dadc", "#f1faee"],
  },
  {
    id: "arctic-frost",
    name: "Arctic Frost",
    description: "Frío y nítido, precisión invernal",
    colors: {
      primary: "#4a6fa5",
      primaryHover: "#6389bf",
      foreground: "#2a3a4a",
      background: "#fafbfc",
      secondary: "#e8eff7",
      mutedForeground: "#6a8090",
      accent: "#a0b8d0",
      border: "#d4e1ed",
      cardBg: "#fafbfc",
      sedeConcepcion: "#4a6fa5",
      sedeConcepcionBg: "#e8eff7",
      sedeCoyhaique: "#c0a040",
      sedeCoyhaiqueBg: "#f7f3e4",
    },
    preview: ["#4a6fa5", "#6389bf", "#d4e4f7", "#fafafa"],
  },
  {
    id: "sunset-boulevard",
    name: "Sunset Boulevard",
    description: "Cálido y vibrante, hora dorada",
    colors: {
      primary: "#e76f51",
      primaryHover: "#f4a261",
      foreground: "#264653",
      background: "#fdf8f5",
      secondary: "#fde8d8",
      mutedForeground: "#5a6a6a",
      accent: "#f4a261",
      border: "#e8d5c4",
      cardBg: "#fdf8f5",
      sedeConcepcion: "#e76f51",
      sedeConcepcionBg: "#fde8d8",
      sedeCoyhaique: "#2a9d8f",
      sedeCoyhaiqueBg: "#e0f5f0",
    },
    preview: ["#264653", "#e76f51", "#f4a261", "#fdf8f5"],
  },
  {
    id: "midnight-galaxy",
    name: "Midnight Galaxy",
    description: "Dramático y cósmico, púrpuras profundos",
    colors: {
      primary: "#6a5acd",
      primaryHover: "#a490c2",
      foreground: "#2b1e3e",
      background: "#faf8fd",
      secondary: "#eee8f5",
      mutedForeground: "#6a5a7a",
      accent: "#a490c2",
      border: "#d8d0e5",
      cardBg: "#faf8fd",
      sedeConcepcion: "#6a5acd",
      sedeConcepcionBg: "#eee8f5",
      sedeCoyhaique: "#d4a261",
      sedeCoyhaiqueBg: "#fdf5e6",
    },
    preview: ["#2b1e3e", "#6a5acd", "#a490c2", "#faf8fd"],
  },
  {
    id: "desert-rose",
    name: "Desert Rose",
    description: "Suave y sofisticado, tonos tierra",
    colors: {
      primary: "#b87d6d",
      primaryHover: "#d4a5a5",
      foreground: "#5d2e46",
      background: "#fdf9f7",
      secondary: "#f5ebe4",
      mutedForeground: "#8a6a6a",
      accent: "#d4a5a5",
      border: "#e8d5c4",
      cardBg: "#fdf9f7",
      sedeConcepcion: "#b87d6d",
      sedeConcepcionBg: "#f5ebe4",
      sedeCoyhaique: "#8faa6a",
      sedeCoyhaiqueBg: "#eef4e4",
    },
    preview: ["#5d2e46", "#b87d6d", "#d4a5a5", "#fdf9f7"],
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    description: "Rico y otoñal, cálido y acogedor",
    colors: {
      primary: "#c1666b",
      primaryHover: "#d48a8e",
      foreground: "#4a403a",
      background: "#fdf9f4",
      secondary: "#f0e8dc",
      mutedForeground: "#7a6a5a",
      accent: "#f4a900",
      border: "#ddd0bc",
      cardBg: "#fdf9f4",
      sedeConcepcion: "#c1666b",
      sedeConcepcionBg: "#f5e8e4",
      sedeCoyhaique: "#f4a900",
      sedeCoyhaiqueBg: "#fdf5e0",
    },
    preview: ["#4a403a", "#c1666b", "#f4a900", "#fdf9f4"],
  },
  {
    id: "botanical-garden",
    name: "Botanical Garden",
    description: "Fresco y vibrante, jardín natural",
    colors: {
      primary: "#4a7c59",
      primaryHover: "#5e9a6f",
      foreground: "#2a3a2a",
      background: "#f5f3ed",
      secondary: "#e8f0e4",
      mutedForeground: "#6a7a5a",
      accent: "#f9a620",
      border: "#d4dcc8",
      cardBg: "#f5f3ed",
      sedeConcepcion: "#4a7c59",
      sedeConcepcionBg: "#e8f0e4",
      sedeCoyhaique: "#f9a620",
      sedeCoyhaiqueBg: "#fdf6e3",
    },
    preview: ["#4a7c59", "#f9a620", "#b7472a", "#f5f3ed"],
  },
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    description: "Limpio y contemporáneo, escala de grises",
    colors: {
      primary: "#36454f",
      primaryHover: "#506a78",
      foreground: "#1a1a1a",
      background: "#ffffff",
      secondary: "#f2f2f2",
      mutedForeground: "#708090",
      accent: "#708090",
      border: "#d3d3d3",
      cardBg: "#ffffff",
      sedeConcepcion: "#36454f",
      sedeConcepcionBg: "#f0f0f0",
      sedeCoyhaique: "#b0960a",
      sedeCoyhaiqueBg: "#f7f5e8",
    },
    preview: ["#36454f", "#708090", "#d3d3d3", "#ffffff"],
  },
  {
    id: "tech-innovation",
    name: "Tech Innovation",
    description: "Audaz y moderno, tecnología punta",
    colors: {
      primary: "#0066ff",
      primaryHover: "#3388ff",
      foreground: "#1a1a2e",
      background: "#fafbff",
      secondary: "#e8f0ff",
      mutedForeground: "#5a6a8a",
      accent: "#00bbcc",
      border: "#d0dff0",
      cardBg: "#fafbff",
      sedeConcepcion: "#0066ff",
      sedeConcepcionBg: "#e8f0ff",
      sedeCoyhaique: "#ff8c00",
      sedeCoyhaiqueBg: "#fff3e0",
    },
    preview: ["#1a1a2e", "#0066ff", "#00bbcc", "#fafbff"],
  },

  /* ══════════════════════════════
     DARK THEMES
     ══════════════════════════════ */
  {
    id: "midnight-dark",
    name: "Midnight Dark",
    description: "Modo oscuro elegante, ideal para la noche",
    dark: true,
    colors: {
      primary: "#7c9aff",
      primaryHover: "#a0b8ff",
      foreground: "#e4e6eb",
      background: "#0f1117",
      secondary: "#1a1d27",
      mutedForeground: "#8b90a0",
      accent: "#7c9aff",
      border: "#2a2d3a",
      cardBg: "#161821",
      sedeConcepcion: "#7c9aff",
      sedeConcepcionBg: "#1c2035",
      sedeCoyhaique: "#ffb347",
      sedeCoyhaiqueBg: "#2a2215",
    },
    preview: ["#0f1117", "#7c9aff", "#1a1d27", "#e4e6eb"],
  },
  {
    id: "forest-night",
    name: "Forest Night",
    description: "Bosque nocturno, verde oscuro profundo",
    dark: true,
    colors: {
      primary: "#6dbf7b",
      primaryHover: "#8fd49a",
      foreground: "#d8ddd2",
      background: "#0e1410",
      secondary: "#1a241c",
      mutedForeground: "#8a9a85",
      accent: "#6dbf7b",
      border: "#2a3a2c",
      cardBg: "#141e16",
      sedeConcepcion: "#6dbf7b",
      sedeConcepcionBg: "#1a2e1e",
      sedeCoyhaique: "#e8b84d",
      sedeCoyhaiqueBg: "#2a2515",
    },
    preview: ["#0e1410", "#6dbf7b", "#1a241c", "#d8ddd2"],
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    description: "Oc\u00e9ano profundo, azules oscuros relajantes",
    dark: true,
    colors: {
      primary: "#4dd0e1",
      primaryHover: "#80deea",
      foreground: "#d4e6eb",
      background: "#0a1118",
      secondary: "#12202a",
      mutedForeground: "#7a98a8",
      accent: "#4dd0e1",
      border: "#1e3040",
      cardBg: "#0f1a24",
      sedeConcepcion: "#4dd0e1",
      sedeConcepcionBg: "#122830",
      sedeCoyhaique: "#ffab40",
      sedeCoyhaiqueBg: "#2a2010",
    },
    preview: ["#0a1118", "#4dd0e1", "#12202a", "#d4e6eb"],
  },
  {
    id: "galaxy-purple",
    name: "Galaxy Purple",
    description: "Galaxia p\u00farpura, modo noche c\u00f3smico",
    dark: true,
    colors: {
      primary: "#b388ff",
      primaryHover: "#ce9cff",
      foreground: "#e0d8ef",
      background: "#110e1a",
      secondary: "#1c1730",
      mutedForeground: "#9488aa",
      accent: "#b388ff",
      border: "#2e2648",
      cardBg: "#171224",
      sedeConcepcion: "#b388ff",
      sedeConcepcionBg: "#221a3a",
      sedeCoyhaique: "#ffd54f",
      sedeCoyhaiqueBg: "#2a2515",
    },
    preview: ["#110e1a", "#b388ff", "#1c1730", "#e0d8ef"],
  },
];

export const DEFAULT_THEME = "forest-canopy";

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
