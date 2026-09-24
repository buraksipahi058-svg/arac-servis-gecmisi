import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { buttonClass } from "@/components/ui/button-styles";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-4 px-4 py-10">
      <BrandMark className="size-12" />
      <h1 className="text-2xl font-bold tracking-tight">Sayfa bulunamadı</h1>
      <p className="text-ink-600">Aradığın sayfa yok ya da görüntüleme yetkin bulunmuyor.</p>
      <Link href="/" className={buttonClass("secondary")}>
        Ana sayfaya dön
      </Link>
    </main>
  );
}
