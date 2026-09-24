import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { Brand } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard-nav";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  // Proxy zaten yönlendiriyor; burada ikinci kez kontrol edilir (tek katmana güvenilmez).
  const { user } = await requireUser();

  return (
    <div className="min-h-dvh">
      <header className="bg-ink-900 text-white">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-3 px-4">
          <Brand href="/dashboard" tone="light" />
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-sm text-ink-200 sm:inline">{user.email}</span>
            <form action={logout}>
              <SubmitButton variant="onDark" size="sm" pendingText="Çıkılıyor…">
                <LogOut aria-hidden />
                Çıkış yap
              </SubmitButton>
            </form>
          </div>
        </div>
        <div aria-hidden className="h-0.5 bg-gradient-to-r from-gold-500 via-gold-300 to-transparent" />
      </header>
      <DashboardNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
