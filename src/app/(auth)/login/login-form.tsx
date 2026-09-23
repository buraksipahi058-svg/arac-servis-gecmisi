"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { login, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}

      <input type="hidden" name="next" value={nextPath} />
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
        autoComplete="current-password"
        required
      />

      <SubmitButton pendingText="Giriş yapılıyor…" className="mt-2 w-full">
        Giriş yap
      </SubmitButton>
    </form>
  );
}
