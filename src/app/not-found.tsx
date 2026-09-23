import Link from "next/link";
import { buttonClass } from "@/components/ui/button-styles";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-4 px-4 py-10">
      <h1 className="text-xl font-semibold">Sayfa bulunamadı</h1>
      <p className="text-gray-600">Aradığın sayfa yok ya da görüntüleme yetkin bulunmuyor.</p>
      <Link href="/dashboard" className={buttonClass("secondary")}>
        Araçlarıma dön
      </Link>
    </main>
  );
}
