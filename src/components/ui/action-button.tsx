"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionState } from "@/lib/action-state";
import type { ButtonSize, ButtonVariant } from "./button-styles";
import { FormAlert } from "./form-alert";
import { SubmitButton } from "./submit-button";

type ActionButtonProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  pendingText: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

// Tek tıkla çalışan, hata mesajını gösteren form butonu (onayla / onayı geri al gibi).
export function ActionButton({ action, children, pendingText, variant = "primary", size = "sm" }: ActionButtonProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <SubmitButton variant={variant} size={size} pendingText={pendingText}>
        {children}
      </SubmitButton>
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
    </form>
  );
}
