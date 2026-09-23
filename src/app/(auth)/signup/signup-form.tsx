"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { signup, type AuthFormState } from "../actions";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signup, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <FormAlert tone="error">{state.error}</FormAlert>}
      {state.message && <FormAlert tone="success">{state.message}</FormAlert>}

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
    </form>
  );
}
