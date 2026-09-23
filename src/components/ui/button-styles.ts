const base =
  "inline-flex h-12 items-center justify-center rounded-lg px-4 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: `${base} bg-gray-900 text-white hover:bg-gray-800`,
  secondary: `${base} border border-gray-300 bg-white text-gray-900 hover:bg-gray-100`,
} as const;

export type ButtonVariant = keyof typeof buttonStyles;
