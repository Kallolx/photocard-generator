export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Darkens a hex color by `amount` (0–1). Falls back to a dark overlay if parsing fails. */
export function darkenHexColor(hex: string, amount: number = 0.2): string {
  const clean = (hex ?? "").replace(/^#/, "");
  const n = parseInt(clean, 16);
  if (!clean || isNaN(n) || clean.length < 6) return "rgba(0,0,0,0.8)";
  const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 255) * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}
