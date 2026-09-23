import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 text-sm font-semibold text-gray-500">
        Araç Servis Geçmişi
      </Link>
      {children}
    </main>
  );
}
