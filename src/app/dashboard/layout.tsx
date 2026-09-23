import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proxy zaten yönlendiriyor; burada ikinci kez kontrol edilir (tek katmana güvenilmez).
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-3 px-4">
          <Link href="/dashboard" className="truncate text-sm font-semibold">
            Araç Servis Geçmişi
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-sm text-gray-500 sm:inline">
              {user.email}
            </span>
            <form action={logout}>
              <SubmitButton
                variant="secondary"
                pendingText="Çıkılıyor…"
                className="h-9 px-3 text-sm"
              >
                Çıkış yap
              </SubmitButton>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
