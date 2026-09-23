"use client";

import { useActionState, type FormEvent } from "react";
import type { ActionState } from "@/lib/action-state";
import { FormAlert } from "./form-alert";
import { SubmitButton } from "./submit-button";

type ConfirmActionButtonProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  confirmMessage: string;
  label: string;
  pendingText: string;
};

// Geri alınamaz işlemler (silme) için onay isteyen, hata mesajını gösteren form butonu.
export function ConfirmActionButton({
  action,
  confirmMessage,
  label,
  pendingText,
}: ConfirmActionButtonProps) {
  const [state, formAction] = useActionState(action, {});

  function confirmSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={confirmSubmit} className="flex flex-col gap-3">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <SubmitButton
        variant="secondary"
        pendingText={pendingText}
        className="w-full border-red-300 text-red-700 hover:bg-red-50"
      >
        {label}
      </SubmitButton>
    </form>
  );
}
