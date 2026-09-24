"use client";

import { useActionState } from "react";
import type { VehicleFormState } from "@/app/dashboard/vehicles/actions";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { TextField } from "@/components/ui/text-field";
import { VehicleTypeIcon } from "@/components/vehicles/vehicle-type-icon";
import type { VehicleFormValues } from "@/lib/vehicles/validation";
import { DEFAULT_VEHICLE_TYPE, VEHICLE_TYPES } from "@/lib/vehicles/vehicle-types";

type VehicleFormProps = {
  action: (state: VehicleFormState, formData: FormData) => Promise<VehicleFormState>;
  initialValues?: VehicleFormValues;
  submitLabel: string;
  pendingText: string;
};

const EMPTY_VALUES: VehicleFormValues = {
  vehicleType: DEFAULT_VEHICLE_TYPE,
  plate: "",
  make: "",
  model: "",
  modelYear: "",
};

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
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.formError && <FormAlert tone="error">{state.formError}</FormAlert>}

      <fieldset>
        <legend className="text-sm font-semibold text-ink-800">Araç tipi</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {VEHICLE_TYPES.map((type) => (
            <label
              key={type.value}
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-sand-300 bg-white px-2 py-3 text-center text-sm font-medium text-ink-700 shadow-sm transition-colors hover:border-ink-300 has-checked:border-ink-900 has-checked:bg-ink-900 has-checked:text-white has-focus-visible:ring-4 has-focus-visible:ring-gold-400/40"
            >
              <input
                type="radio"
                name="vehicleType"
                value={type.value}
                defaultChecked={values.vehicleType === type.value}
                className="sr-only"
              />
              <VehicleTypeIcon type={type.value} className="size-6" strokeWidth={1.75} />
              <span className="leading-tight">{type.label}</span>
            </label>
          ))}
        </div>
        {errors.vehicleType && <p className="mt-1.5 text-sm text-red-700">{errors.vehicleType}</p>}
      </fieldset>

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
