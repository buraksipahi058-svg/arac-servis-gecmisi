"use client";

import { useActionState } from "react";
import { openSharedHistory } from "@/app/shared/actions";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";

export function OpenSharedForm() {
  const [state, formAction] = useActionState(openSharedHistory, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      <TextField
        label="Plaka"
        name="plate"
        placeholder="34 ABC 123"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        required
      />
      <TextField
        label="Paylaşım kodu"
        name="code"
        placeholder="X7K9-P4M2"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        required
      />
      <SubmitButton pendingText="Kontrol ediliyor…" className="mt-2 w-full">
        Geçmişi görüntüle
      </SubmitButton>
    </form>
  );
}
