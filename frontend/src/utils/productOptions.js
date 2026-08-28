export const DEFAULT_SIZES = "S,M,L,XL";
export const DEFAULT_COLORS = "Black,White";

export function parseOptionList(value, fallback) {
  const raw = value && value.trim() ? value : fallback;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
