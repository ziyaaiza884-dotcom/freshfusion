export type FontPair =
  | "playfair-inter"
  | "dmserif-dmsans"
  | "fraunces-inter"
  | "spectral-inter";

export interface ThemeTokens {
  background: string;
  surface: string;
  "surface-muted": string;
  foreground: string;
  "muted-foreground": string;
  border: string;
  primary: string;
  "primary-strong": string;
  "primary-foreground": string;
  accent: string;
  "accent-foreground": string;
  spice: string;
  ring: string;
  radius: string;
}

export interface Theme {
  id: string;
  name: string;
  region: string;
  blurb: string;
  dark: boolean;
  fontPair: FontPair;
  tokens: ThemeTokens;
}

export const TOKEN_KEYS: (keyof ThemeTokens)[] = [
  "background",
  "surface",
  "surface-muted",
  "foreground",
  "muted-foreground",
  "border",
  "primary",
  "primary-strong",
  "primary-foreground",
  "accent",
  "accent-foreground",
  "spice",
  "ring",
  "radius",
];

export const FONT_PAIRS: Record<
  FontPair,
  { serif: string; sans: string; label: string }
> = {
  "playfair-inter": {
    serif: "var(--font-playfair), Georgia, serif",
    sans: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    label: "Playfair Display / Inter",
  },
  "dmserif-dmsans": {
    serif: "var(--font-dm-serif), Georgia, serif",
    sans: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif",
    label: "DM Serif Display / DM Sans",
  },
  "fraunces-inter": {
    serif: "var(--font-fraunces), Georgia, serif",
    sans: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    label: "Fraunces / Inter",
  },
  "spectral-inter": {
    serif: "var(--font-spectral), Georgia, serif",
    sans: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    label: "Spectral / Inter",
  },
};

export const THEMES: Theme[] = [
  {
    id: "everyday",
    name: "Everyday",
    region: "House default",
    blurb: "A spice merchant's pantry at dusk — warm dark ink, ghee gold and lamplight.",
    dark: true,
    fontPair: "fraunces-inter",
    tokens: {
      background: "#17130f",
      surface: "#221b14",
      "surface-muted": "#2b2318",
      foreground: "#f3e9d8",
      "muted-foreground": "#ab9c84",
      border: "#3c3122",
      primary: "#c9932f",
      "primary-strong": "#dba847",
      "primary-foreground": "#1b140b",
      accent: "#d1452c",
      "accent-foreground": "#fdf3e7",
      spice: "#c97a3d",
      ring: "#c9932f",
      radius: "0.75rem",
    },
  },
  {
    id: "onam",
    name: "Onam",
    region: "Kerala",
    blurb: "Harvest gold and pookalam marigold on bright white — festive and open.",
    dark: false,
    fontPair: "dmserif-dmsans",
    tokens: {
      background: "#fffdf5",
      surface: "#ffffff",
      "surface-muted": "#fdf3d8",
      foreground: "#33301f",
      "muted-foreground": "#7a6f4a",
      border: "#efe4bf",
      primary: "#2f7d4f",
      "primary-strong": "#1f5c39",
      "primary-foreground": "#fffdf5",
      accent: "#e8632a",
      "accent-foreground": "#ffffff",
      spice: "#f2a71c",
      ring: "#2f7d4f",
      radius: "1.1rem",
    },
  },
  {
    id: "diwali",
    name: "Diwali",
    region: "India",
    blurb: "Deep plum night lit by lamp gold and crimson — the festival of lights.",
    dark: true,
    fontPair: "fraunces-inter",
    tokens: {
      background: "#241726",
      surface: "#2f1f31",
      "surface-muted": "#3a2740",
      foreground: "#f6e9d8",
      "muted-foreground": "#b79db0",
      border: "#47324c",
      primary: "#d99a2b",
      "primary-strong": "#b87e18",
      "primary-foreground": "#241726",
      accent: "#e0454b",
      "accent-foreground": "#ffffff",
      spice: "#f2b544",
      ring: "#d99a2b",
      radius: "0.7rem",
    },
  },
  {
    id: "ramadan",
    name: "Ramadan",
    region: "Middle East",
    blurb: "A serene indigo night with crescent gold and cream — calm and quiet.",
    dark: true,
    fontPair: "spectral-inter",
    tokens: {
      background: "#14203a",
      surface: "#1c2c4a",
      "surface-muted": "#26385c",
      foreground: "#eef2fb",
      "muted-foreground": "#9db0d1",
      border: "#33456f",
      primary: "#c9a44e",
      "primary-strong": "#ad8836",
      "primary-foreground": "#14203a",
      accent: "#e2795a",
      "accent-foreground": "#ffffff",
      spice: "#c9a44e",
      ring: "#c9a44e",
      radius: "0.4rem",
    },
  },
  {
    id: "eid",
    name: "Eid",
    region: "Middle East / India",
    blurb: "Emerald, gold and ivory — the bright, celebratory daytime counterpart.",
    dark: false,
    fontPair: "dmserif-dmsans",
    tokens: {
      background: "#f6fbf6",
      surface: "#ffffff",
      "surface-muted": "#e6f2ea",
      foreground: "#1e2a24",
      "muted-foreground": "#5f7168",
      border: "#d2e6da",
      primary: "#0f7a52",
      "primary-strong": "#0a5c3d",
      "primary-foreground": "#f6fbf6",
      accent: "#b9832a",
      "accent-foreground": "#ffffff",
      spice: "#d7b25a",
      ring: "#0f7a52",
      radius: "0.95rem",
    },
  },
  {
    id: "christmas",
    name: "Christmas",
    region: "Kerala / Gulf",
    blurb: "Pine green and cranberry over cream, with a gold glint. Cosy and classic.",
    dark: false,
    fontPair: "playfair-inter",
    tokens: {
      background: "#f7f4ec",
      surface: "#ffffff",
      "surface-muted": "#e9efe6",
      foreground: "#22302a",
      "muted-foreground": "#5c6b60",
      border: "#d8e0d3",
      primary: "#1f5138",
      "primary-strong": "#143a27",
      "primary-foreground": "#f7f4ec",
      accent: "#b21f3a",
      "accent-foreground": "#ffffff",
      spice: "#c9a13f",
      ring: "#1f5138",
      radius: "0.6rem",
    },
  },
  {
    id: "nowruz",
    name: "Nowruz",
    region: "Persian / Gulf",
    blurb: "Spring turquoise, saffron and blossom pink — the Persian new year.",
    dark: false,
    fontPair: "fraunces-inter",
    tokens: {
      background: "#f4fbfa",
      surface: "#ffffff",
      "surface-muted": "#e2f2ef",
      foreground: "#223330",
      "muted-foreground": "#5b736e",
      border: "#cbe8e2",
      primary: "#1f9e8f",
      "primary-strong": "#147a6e",
      "primary-foreground": "#f4fbfa",
      accent: "#e46c8b",
      "accent-foreground": "#ffffff",
      spice: "#efab2e",
      ring: "#1f9e8f",
      radius: "1rem",
    },
  },
];

export const THEME_IDS = THEMES.map((t) => t.id);
export const DEFAULT_THEME_ID = "everyday";

export const getTheme = (id: string): Theme =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];

export const isThemeId = (id: unknown): id is string =>
  typeof id === "string" && THEME_IDS.includes(id);

/** inline style object for applying a theme to a wrapper element */
export function themeStyle(id: string): React.CSSProperties {
  const theme = getTheme(id);
  const pair = FONT_PAIRS[theme.fontPair];
  const style: Record<string, string> = {
    "--font-serif": pair.serif,
    "--font-sans": pair.sans,
  };
  for (const key of TOKEN_KEYS) {
    style[`--${key}`] = theme.tokens[key];
  }
  return style as React.CSSProperties;
}
