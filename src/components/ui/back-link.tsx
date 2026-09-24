import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
    >
      <ChevronLeft aria-hidden className="size-4" />
      {children}
    </Link>
  );
}
