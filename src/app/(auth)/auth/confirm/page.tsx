import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MailCheck } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { isConfirmationType } from "@/lib/email-confirmation";
import { safeNextPath } from "@/lib/safe-redirect";
import { confirmEmail } from "../../actions";

export const metadata: Metadata = {
  title: "E-posta doğrulama",
  robots: { index: false, follow: false },
};

// E-postadaki doğrulama bağlantısı bu sayfayı açar. Sayfayı açmak (GET/HEAD) hiçbir şey değiştirmez;
// token, kullanıcı butona bastığında confirmEmail ile doğrulanır.
export default async function ConfirmEmailPage({ searchParams }: PageProps<"/auth/confirm">) {
  const { token_hash: tokenHash, type, next } = await searchParams;
  if (typeof tokenHash !== "string" || !tokenHash || !isConfirmationType(type)) {
    redirect("/login?dogrulama=gecersiz");
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-700">
        <MailCheck aria-hidden className="size-6" />
      </span>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">E-posta adresini doğrula</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Hesabını açmak için aşağıdaki butona dokun. Bu hesabı sen oluşturmadıysan bu sayfayı kapat.
        </p>
      </div>
      <form action={confirmEmail}>
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={safeNextPath(next)} />
        <SubmitButton pendingText="Doğrulanıyor…" className="w-full">
          E-posta adresimi doğrula
        </SubmitButton>
      </form>
    </div>
  );
}
