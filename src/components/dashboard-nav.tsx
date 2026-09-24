"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, UserRound, Users } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Araçlarım", icon: Car, match: (path: string) => path === "/dashboard" || path.startsWith("/dashboard/vehicles") },
  { href: "/dashboard/users", label: "Kullanıcılar", icon: Users, match: (path: string) => path.startsWith("/dashboard/users") },
  { href: "/dashboard/profile", label: "Profilim", icon: UserRound, match: (path: string) => path.startsWith("/dashboard/profile") },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Ana menü" className="border-b border-sand-200 bg-white">
      {/* Mobilde eşit genişlikte sekmeler, geniş ekranda sola hizalı. */}
      <ul className="mx-auto grid w-full max-w-3xl grid-cols-3 sm:flex sm:gap-1 sm:px-4">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-12 w-full items-center justify-center gap-1.5 border-b-2 px-1 text-sm font-semibold transition-colors sm:justify-start sm:px-3 ${
                  active
                    ? "border-gold-500 text-ink-900"
                    : "border-transparent text-ink-500 hover:text-ink-900"
                }`}
              >
                <Icon aria-hidden className="size-4 max-[359px]:hidden" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
