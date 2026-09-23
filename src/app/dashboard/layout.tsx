import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  // Proxy zaten yönlendiriyor; burada ikinci kez kontrol edilir (tek katmana güvenilmez).
  const { user } = await requireUser();

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
                size="sm"
                pendingText="Çıkılıyor…"
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
