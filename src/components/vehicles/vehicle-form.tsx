"use client";

import { useActionState } from "react";
import type { VehicleFormState } from "@/app/dashboard/vehicles/actions";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import type { VehicleFormValues } from "@/lib/vehicles/validation";

type VehicleFormProps = {
  action: (state: VehicleFormState, formData: FormData) => Promise<VehicleFormState>;
  initialValues?: VehicleFormValues;
  submitLabel: string;
  pendingText: string;
};

const EMPTY_VALUES: VehicleFormValues = { plate: "", make: "", model: "", modelYear: "" };

export function VehicleForm({
  action,
  initialValues = EMPTY_VALUES,
  submitLabel,
  pendingText,
}: VehicleFormProps) {
  const [state, formAction] = useActionState(action, { values: initialValues });
  const values = state.values ?? initialValues;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.formError && <FormAlert tone="error">{state.formError}</FormAlert>}

      <TextField
        label="Plaka"
        name="plate"
        placeholder="34 ABC 123"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        required
        defaultValue={values.plate}
        error={errors.plate}
      />
      <TextField
        label="Marka"
        name="make"
        placeholder="Toyota"
        autoComplete="off"
        maxLength={50}
        required
        defaultValue={values.make}
        error={errors.make}
      />
      <TextField
        label="Model"
        name="model"
        placeholder="Corolla"
        autoComplete="off"
        maxLength={50}
        required
        defaultValue={values.model}
        error={errors.model}
      />
      <TextField
        label="Model yılı"
        name="modelYear"
        placeholder="2021"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        autoComplete="off"
        required
        defaultValue={values.modelYear}
        error={errors.modelYear}
      />

      <SubmitButton pendingText={pendingText} className="mt-2 w-full">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
