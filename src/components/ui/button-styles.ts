const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-gray-900 text-white hover:bg-gray-800",
  secondary: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-100",
  danger: "border border-red-300 bg-white text-red-700 hover:bg-red-50",
} as const;

// Yükseklik/dolgu çakışmasın diye boyut ayrı seçilir (sınıf ekleyerek ezilmez).
const sizes = {
  md: "h-12 px-4 text-base",
  sm: "h-10 px-3 text-sm",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}
