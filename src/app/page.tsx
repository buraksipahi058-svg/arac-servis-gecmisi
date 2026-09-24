import Link from "next/link";
import { Camera, History, KeyRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { buttonClass } from "@/components/ui/button-styles";
import { cardClass } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  {
    icon: History,
    title: "Tüm servis geçmişi tek yerde",
    text: "Bakım, onarım ve parça değişimlerini tarih ve kilometreyle kaydet; yıllara göre zaman çizelgesinde gör.",
  },
  {
    icon: Camera,
    title: "Fatura ve fotoğraflar",
    text: "Servis fişi, fatura veya parça fotoğrafını kayda ekle. Fotoğraflar yüklenmeden önce küçültülür.",
  },
  {
    icon: KeyRound,
    title: "Kontrollü paylaşım",
    text: "Geçmişi 24 saat geçerli bir kodla göster; istediğin an iptal et. Kişisel bilgilerin paylaşılmaz.",
  },
] as const;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-dvh">
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-ink-800 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gold-400/10 blur-3xl"
        />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pb-14 pt-8">
          <Brand tone="light" />
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">
              Dijital servis defteri
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              Aracının servis geçmişi, tek yerde ve senin kontrolünde.
            </h1>
            <p className="mt-4 text-ink-200">
              Aracının bakım, onarım ve parça değişimi kayıtlarını tek yerde tut.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Link href="/dashboard" className={buttonClass("accent")}>
                Araçlarıma git
              </Link>
            ) : (
              <>
                <Link href="/signup" className={buttonClass("accent")}>
                  Kayıt ol
                </Link>
                <Link href="/login" className={buttonClass("onDark")}>
                  Giriş yap
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-3xl gap-4 px-4 py-10 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <article key={title} className={`${cardClass} p-5`}>
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
              <Icon aria-hidden className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold text-ink-900">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{text}</p>
          </article>
        ))}
      </section>

      <p className="px-4 pb-12 text-center text-sm text-ink-600">
        {"Sana bir paylaşım kodu mu verildi? "}
        <Link
          href="/shared"
          className="font-semibold text-ink-900 underline decoration-gold-400 decoration-2 underline-offset-4"
        >
          Geçmişi görüntüle
        </Link>
      </p>
    </main>
  );
}
