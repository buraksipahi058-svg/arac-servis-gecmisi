import Link from "next/link";

// Uygulama işareti: uygulama ikonuyla aynı kilometre göstergesi (src/lib/app-icon.tsx).
export function BrandMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <rect width="32" height="32" rx="7" fill="#121c2d" />
      <path d="M9.4 22.6a9.3 9.3 0 1 1 13.2 0" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M16 16.5l5-4.2" stroke="#d9a948" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

type BrandProps = {
  href?: string;
  // Koyu zemin (üst bar, karşılama bölümü) için açık renk yazı.
  tone?: "dark" | "light";
};

export function Brand({ href = "/", tone = "dark" }: BrandProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight ${tone === "light" ? "text-white" : "text-ink-900"}`}
    >
      <BrandMark className={`size-8 ${tone === "light" ? "ring-1 ring-white/15 rounded-[7px]" : ""}`} />
      <span className="text-[0.95rem]">Araç Servis Geçmişi</span>
    </Link>
  );
}
