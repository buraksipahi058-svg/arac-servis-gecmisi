const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sand-50 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-[1.1em] [&_svg]:shrink-0";

const variants = {
  primary: "bg-ink-900 text-white shadow-sm hover:bg-ink-800 active:bg-ink-950",
  secondary: "border border-sand-300 bg-white text-ink-900 shadow-sm hover:border-ink-300 hover:bg-sand-50",
  danger: "border border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50",
  // Koyu zemin üzerindeki öne çıkan eylem (ana sayfa).
  accent: "bg-gold-400 text-ink-950 shadow-sm hover:bg-gold-300",
  // Koyu zemin üzerindeki ikincil eylem (üst bar, ana sayfa).
  onDark: "border border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
} as const;

// Yükseklik/dolgu çakışmasın diye boyut ayrı seçilir (sınıf ekleyerek ezilmez).
const sizes = {
  md: "h-12 px-5 text-base",
  sm: "h-10 px-3.5 text-sm",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}
