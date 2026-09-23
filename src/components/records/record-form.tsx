"use client";

import { useActionState } from "react";
import type { RecordFormState } from "@/app/dashboard/vehicles/[vehicleId]/records/actions";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextAreaField } from "@/components/ui/text-area-field";
import { TextField } from "@/components/ui/text-field";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_SERVICE_NAME_LENGTH,
  type RecordFormValues,
} from "@/lib/records/validation";

type RecordFormProps = {
  action: (state: RecordFormState, formData: FormData) => Promise<RecordFormState>;
  initialValues: RecordFormValues;
  maxDate: string;
  submitLabel: string;
  pendingText: string;
};

export function RecordForm({
  action,
  initialValues,
  maxDate,
  submitLabel,
  pendingText,
}: RecordFormProps) {
  const [state, formAction] = useActionState(action, { values: initialValues });
  const values = state.values ?? initialValues;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.formError && <FormAlert tone="error">{state.formError}</FormAlert>}

      <TextField
        label="Tarih"
        name="serviceDate"
        type="date"
        max={maxDate}
        required
        defaultValue={values.serviceDate}
        error={errors.serviceDate}
      />
      <TextField
        label="Kilometre"
        name="odometerKm"
        placeholder="58700"
        inputMode="numeric"
        autoComplete="off"
        required
        defaultValue={values.odometerKm}
        error={errors.odometerKm}
      />
      <TextField
        label="Servis"
        name="serviceName"
        placeholder="ABC Oto"
        autoComplete="off"
        maxLength={MAX_SERVICE_NAME_LENGTH}
        required
        defaultValue={values.serviceName}
        error={errors.serviceName}
      />
      <TextAreaField
        label="İşlem açıklaması"
        name="description"
        placeholder="Motor yağı ve yağ filtresi değiştirildi."
        maxLength={MAX_DESCRIPTION_LENGTH}
        rows={4}
        required
        defaultValue={values.description}
        error={errors.description}
      />

      <SubmitButton pendingText={pendingText} className="mt-2 w-full">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
