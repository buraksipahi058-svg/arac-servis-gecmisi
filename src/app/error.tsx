"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { buttonClass } from "@/components/ui/button-styles";

// Beklenmeyen sunucu/istemci hatalarında gösterilir; hata ayrıntısı kullanıcıya gösterilmez.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-4 px-4 py-10">
      <BrandMark className="size-12" />
      <h1 className="text-2xl font-bold tracking-tight">Bir sorun oluştu</h1>
      <p className="text-ink-600">
        Sayfa yüklenirken beklenmeyen bir hata oldu. Biraz sonra tekrar deneyebilirsin.
      </p>
      <button type="button" onClick={() => retry()} className={buttonClass("primary")}>
        Tekrar dene
      </button>
      <Link href="/" className={buttonClass("secondary")}>
        Ana sayfaya dön
      </Link>
    </main>
  );
}
