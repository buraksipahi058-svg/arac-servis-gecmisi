import { formatPlate, isValidPlate, normalizePlate } from "./plate";

export type VehicleField = "plate" | "make" | "model" | "modelYear";
export type VehicleFormValues = Record<VehicleField, string>;
export type VehicleFieldErrors = Partial<Record<VehicleField, string>>;

export type VehicleInput = {
  plate: string;
  make: string;
  model: string;
  model_year: number;
};

const MAX_NAME_LENGTH = 50;
const MIN_MODEL_YEAR = 1900;

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateName(value: string, label: string): string | undefined {
  if (!value) return `${label} gerekli.`;
  if (value.length > MAX_NAME_LENGTH) return `${label} en fazla ${MAX_NAME_LENGTH} karakter olabilir.`;
  return undefined;
}

export function parseVehicleForm(formData: FormData): {
  values: VehicleFormValues;
  errors: VehicleFieldErrors;
  data?: VehicleInput;
} {
  const values: VehicleFormValues = {
    plate: readString(formData, "plate"),
    make: readString(formData, "make"),
    model: readString(formData, "model"),
    modelYear: readString(formData, "modelYear"),
  };

  const errors: VehicleFieldErrors = {};

  const plate = normalizePlate(values.plate);
  if (!plate) {
    errors.plate = "Plaka gerekli.";
  } else if (!isValidPlate(plate)) {
    errors.plate = "Geçerli bir plaka gir (örn. 34 ABC 123).";
  }

  const makeError = validateName(values.make, "Marka");
  if (makeError) errors.make = makeError;

  const modelError = validateName(values.model, "Model");
  if (modelError) errors.model = modelError;

  const maxModelYear = new Date().getFullYear() + 1;
  const modelYear = Number(values.modelYear);
  if (!values.modelYear) {
    errors.modelYear = "Model yılı gerekli.";
  } else if (!/^\d{4}$/.test(values.modelYear) || modelYear < MIN_MODEL_YEAR || modelYear > maxModelYear) {
    errors.modelYear = `Model yılı ${MIN_MODEL_YEAR}–${maxModelYear} arasında olmalı.`;
  }

  if (Object.keys(errors).length > 0) {
    return { values, errors };
  }

  return {
    values: { ...values, plate: formatPlate(plate) },
    errors,
    data: { plate, make: values.make, model: values.model, model_year: modelYear },
  };
}
