export const DEFAULT_SIZES = "S,M,L,XL";
export const DEFAULT_COLORS = "Black,White";

export function parseOptionList(value, fallback) {
  const raw = value && value.trim() ? value : fallback;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const COLOR_SWATCHES = {
  black: "#111111",
  white: "#ffffff",
  gray: "#9aa0a6",
  grey: "#9aa0a6",
  red: "#e04444",
  blue: "#3b6fd6",
  navy: "#243a6f",
  green: "#3fa15e",
  yellow: "#f2c94c",
  orange: "#f2994a",
  purple: "#b888ff",
  pink: "#ff7c9c",
  brown: "#8b5e3c",
  beige: "#e8dcc8",
  maroon: "#7a2331",
  teal: "#43b3b9",
  gold: "#fbb419",
  silver: "#c4c9cf",
};

export function colorToSwatch(name) {
  if (!name) return null;
  return COLOR_SWATCHES[name.trim().toLowerCase()] || null;
}
