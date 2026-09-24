"use client";

import { useActionState, useRef, useState } from "react";
import { Copy, KeyRound } from "lucide-react";
import type { CreateShareCodeState } from "@/app/dashboard/vehicles/[vehicleId]/share/actions";
import { buttonClass } from "@/components/ui/button-styles";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateTime } from "@/lib/format";

type CreateShareCodeProps = {
  action: (state: CreateShareCodeState) => Promise<CreateShareCodeState>;
  // Alıcının kodu gireceği adres.
  sharedUrl: string;
};

export function CreateShareCode({ action, sharedUrl }: CreateShareCodeProps) {
  const [state, formAction] = useActionState(action, {});
  const codeRef = useRef<HTMLParagraphElement>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  async function copyCode() {
    if (!state.code) return;
    // Pano API'si yalnızca güvenli bağlamda (HTTPS) var; yoksa kod seçilir.
    if (window.isSecureContext && navigator.clipboard) {
      await navigator.clipboard.writeText(state.code);
      setCopyMessage("Kopyalandı.");
      return;
    }
    const element = codeRef.current;
    const selection = window.getSelection();
    if (element && selection) {
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
      setCopyMessage("Kod seçildi; kopyalayabilirsin.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}

      {state.code && state.expiresAt && (
        <div className="rounded-2xl bg-gradient-to-br from-ink-950 to-ink-800 p-5 text-center text-white shadow-card">
          <p className="inline-flex items-center gap-1.5 text-sm text-ink-200">
            <KeyRound aria-hidden className="size-4 text-gold-300" />
            Paylaşım kodu
          </p>
          <p
            ref={codeRef}
            data-testid="share-code"
            className="mt-2 select-all font-mono text-3xl font-bold tracking-[0.2em] text-gold-300"
          >
            {state.code}
          </p>
          <p className="mt-2 text-sm text-ink-200">
            {`${formatDateTime(state.expiresAt)} tarihine kadar geçerli.`}
          </p>
          <button
            type="button"
            onClick={copyCode}
            className={`${buttonClass("onDark", "sm")} mt-4 w-full`}
          >
            <Copy aria-hidden />
            Kopyala
          </button>
          {copyMessage && <p className="mt-2 text-sm text-ink-200">{copyMessage}</p>}
          <p className="mt-4 text-sm text-ink-200">
            {"Alıcı, "}
            <span className="font-mono text-[0.8rem] font-semibold text-white [overflow-wrap:anywhere]">{sharedUrl}</span>
            {" adresinde plaka ile birlikte bu kodu girer."}
          </p>
          <p className="mt-3 text-sm font-semibold text-gold-200">
            Bu kod yalnızca şimdi gösterilir. Kaydet veya doğrudan paylaşacağın kişiye ilet.
          </p>
        </div>
      )}

      <form action={formAction}>
        <SubmitButton
          variant={state.code ? "secondary" : "primary"}
          pendingText="Oluşturuluyor…"
          className="w-full"
        >
          {state.code ? "Yeni kod oluştur" : "Paylaşım kodu oluştur"}
        </SubmitButton>
      </form>
    </div>
  );
}
