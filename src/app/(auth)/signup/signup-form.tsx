"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailOpen } from "lucide-react";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { resendConfirmation, signup, type AuthFormState, type ResendState } from "../actions";
import { ResendConfirmation } from "../resend-confirmation";

const initialState: AuthFormState = {};
const initialResendState: ResendState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signup, initialState);
  const [resendState, resendAction] = useActionState(resendConfirmation, initialResendState);
  // Kayıt alındı: hesap, e-postadaki bağlantıyla doğrulanınca açılır. JS olmadan "tekrar gönder"
  // kullanıldığında kayıt formunun durumu sıfırlanır; adres o zaman tekrar gönderme sonucundan alınır.
  const pendingEmail = state.message
    ? state.email
    : state === initialState
      ? resendState.email
      : undefined;

  if (pendingEmail) {
    return (
      <div className="flex flex-col gap-4">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-700">
          <MailOpen aria-hidden className="size-6" />
        </span>
        <div role="status">
          <h2 className="text-lg font-bold">E-postanı kontrol et</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-600">
            <span className="font-semibold text-ink-900">{pendingEmail}</span>
            {" adresine bir doğrulama bağlantısı gönderdik. Bağlantının açtığı sayfada onayladığında hesabın açılır. "}
            Bağlantı 1 saat geçerlidir; e-postayı göremiyorsan spam klasörüne de bak.
          </p>
        </div>
        <ResendConfirmation email={pendingEmail} state={resendState} action={resendAction} />
        <Link
          href="/login"
          className="text-center text-sm font-semibold text-ink-900 underline decoration-gold-400 decoration-2 underline-offset-4"
        >
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}

      <TextField
        label="E-posta"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
      />
      <TextField
        label="Şifre"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        hint="En az 8 karakter."
      />
      <TextField
        label="Şifre (tekrar)"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      <SubmitButton pendingText="Hesap oluşturuluyor…" className="mt-2 w-full">
        Kayıt ol
      </SubmitButton>
      <p className="text-xs text-ink-500">
        Kayıttan sonra e-posta adresine bir doğrulama bağlantısı gönderilir.
      </p>
    </form>
  );
}
