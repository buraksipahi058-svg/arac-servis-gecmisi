"use client";

import { MailCheck } from "lucide-react";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ResendState } from "./actions";

type ResendConfirmationProps = {
  email: string;
  // useActionState(resendConfirmation) üst bileşende tutulur: JS olmadan gönderildiğinde üst formun
  // durumu sıfırlansa da sonuç, bu durumdan okunarak gösterilebilir.
  state: ResendState;
  action: (formData: FormData) => void;
};

// Doğrulama e-postasını yeniden gönderme (kayıt sonrası ve doğrulanmamış girişte).
export function ResendConfirmation({ email, state, action }: ResendConfirmationProps) {
  // Başka bir adres için alınmış eski sonuç gösterilmez.
  const result = state.email === email ? state : {};

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="email" value={email} />
      {result.message && <FormAlert tone="success">{result.message}</FormAlert>}
      {result.error && <FormAlert tone="error">{result.error}</FormAlert>}
      <SubmitButton variant="secondary" pendingText="Gönderiliyor…" className="w-full">
        <MailCheck aria-hidden />
        Doğrulama e-postasını tekrar gönder
      </SubmitButton>
    </form>
  );
}
