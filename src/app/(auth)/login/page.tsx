import type { Metadata } from "next";
import Link from "next/link";
import { FormAlert } from "@/components/ui/form-alert";
import { safeNextPath } from "@/lib/safe-redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Giriş yap" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, dogrulama } = await searchParams;

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Giriş yap</h1>
      {dogrulama === "gecersiz" && (
        <div className="mb-4">
          <FormAlert tone="warning">
            Doğrulama bağlantısı geçersiz veya süresi dolmuş. Giriş yapmayı dene; hesabın henüz
            doğrulanmadıysa yeni bir bağlantı isteyebilirsin.
          </FormAlert>
        </div>
      )}
      <LoginForm nextPath={safeNextPath(next)} />
      <p className="mt-6 text-center text-sm text-ink-600">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-semibold text-ink-900 underline decoration-gold-400 decoration-2 underline-offset-4">
          Kayıt ol
        </Link>
      </p>
    </>
  );
}
