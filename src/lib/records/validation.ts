import { todayIsoDate } from "@/lib/format";

export type RecordField = "serviceDate" | "odometerKm" | "serviceName" | "description";
export type RecordFormValues = Record<RecordField, string>;
export type RecordFieldErrors = Partial<Record<RecordField, string>>;

export type RecordInput = {
  service_date: string;
  odometer_km: number;
  service_name: string;
  description: string;
};

export const MAX_SERVICE_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_ODOMETER_KM = 2_000_000;
const MIN_SERVICE_DATE = "1900-01-01";
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isRealDate(isoDate: string): boolean {
  if (!ISO_DATE_PATTERN.test(isoDate)) return false;
  const date = new Date(`${isoDate}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(isoDate);
}

// "58.700", "58 700" → 58700
export function parseKm(value: string): number | null {
  const digits = value.replace(/[.\s]/g, "");
  if (!/^\d+$/.test(digits)) return null;
  return Number(digits);
}

export function parseRecordForm(formData: FormData): {
  values: RecordFormValues;
  errors: RecordFieldErrors;
  data?: RecordInput;
} {
  const values: RecordFormValues = {
    serviceDate: readString(formData, "serviceDate"),
    odometerKm: readString(formData, "odometerKm"),
    serviceName: readString(formData, "serviceName"),
    description: readString(formData, "description"),
  };
  const errors: RecordFieldErrors = {};

  if (!values.serviceDate) {
    errors.serviceDate = "Tarih gerekli.";
  } else if (!isRealDate(values.serviceDate) || values.serviceDate < MIN_SERVICE_DATE) {
    errors.serviceDate = "Geçerli bir tarih gir.";
  } else if (values.serviceDate > todayIsoDate()) {
    errors.serviceDate = "Tarih bugünden ileri olamaz.";
  }

  const odometerKm = parseKm(values.odometerKm);
  if (!values.odometerKm) {
    errors.odometerKm = "Kilometre gerekli.";
  } else if (odometerKm === null || odometerKm > MAX_ODOMETER_KM) {
    errors.odometerKm = "Geçerli bir kilometre gir (sadece rakam).";
  }

  if (!values.serviceName) {
    errors.serviceName = "Servis adı gerekli.";
  } else if (values.serviceName.length > MAX_SERVICE_NAME_LENGTH) {
    errors.serviceName = `Servis adı en fazla ${MAX_SERVICE_NAME_LENGTH} karakter olabilir.`;
  }

  if (!values.description) {
    errors.description = "İşlem açıklaması gerekli.";
  } else if (values.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `İşlem açıklaması en fazla ${MAX_DESCRIPTION_LENGTH} karakter olabilir.`;
  }

  if (Object.keys(errors).length > 0 || odometerKm === null) {
    return { values, errors };
  }

  return {
    values,
    errors,
    data: {
      service_date: values.serviceDate,
      odometer_km: odometerKm,
      service_name: values.serviceName,
      description: values.description,
    },
  };
}
