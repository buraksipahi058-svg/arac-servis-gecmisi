import Link from "next/link";
import { buttonClass } from "@/components/ui/button-styles";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Araç Servis Geçmişi</h1>
        <p className="mt-2 text-gray-600">
          Aracının bakım, onarım ve parça değişimi kayıtlarını tek yerde tut.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {user ? (
          <Link href="/dashboard" className={buttonClass("primary")}>
            Araçlarıma git
          </Link>
        ) : (
          <>
            <Link href="/signup" className={buttonClass("primary")}>
              Kayıt ol
            </Link>
            <Link href="/login" className={buttonClass("secondary")}>
              Giriş yap
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
