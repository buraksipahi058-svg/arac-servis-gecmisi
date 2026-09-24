"use client";

import { useActionState, useRef, useState } from "react";
import type { CreateShareCodeState } from "@/app/dashboard/vehicles/[vehicleId]/share/actions";
import { buttonClass } from "@/components/ui/button-styles";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateTime } from "@/lib/format";

type CreateShareCodeProps = {
  action: (state: CreateShareCodeState) => Promise<CreateShareCodeState>;
};

export function CreateShareCode({ action }: CreateShareCodeProps) {
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
        <div className="rounded-xl border-2 border-gray-900 bg-white p-4 text-center">
          <p className="text-sm text-gray-600">Paylaşım kodu</p>
          <p
            ref={codeRef}
            data-testid="share-code"
            className="mt-1 select-all font-mono text-3xl font-semibold tracking-widest"
          >
            {state.code}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {`${formatDateTime(state.expiresAt)} tarihine kadar geçerli.`}
          </p>
          <button
            type="button"
            onClick={copyCode}
            className={`${buttonClass("secondary", "sm")} mt-3 w-full`}
          >
            Kopyala
          </button>
          {copyMessage && <p className="mt-2 text-sm text-gray-600">{copyMessage}</p>}
          <p className="mt-3 text-sm font-medium text-gray-800">
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
