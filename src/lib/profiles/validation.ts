import { isProvince } from "./provinces";
import { isProfileTitle, type ProfileTitle } from "./titles";

export type ProfileField = "displayName" | "city" | "phone" | "bio" | "titles";

export type ProfileFormValues = {
  displayName: string;
  city: string;
  phone: string;
  bio: string;
  titles: string[];
};

export type ProfileFieldErrors = Partial<Record<ProfileField, string>>;

export type ProfileInput = {
  display_name: string;
  city: string | null;
  phone: string | null;
  bio: string | null;
  titles: ProfileTitle[];
};

export const MAX_BIO_LENGTH = 500;
// DB'deki profiles_phone_format kısıtıyla aynı kural.
const PHONE_PATTERN = /^\+?[0-9 ()-]{7,20}$/;

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function parseProfileForm(formData: FormData): {
  values: ProfileFormValues;
  errors: ProfileFieldErrors;
  data?: ProfileInput;
} {
  const values: ProfileFormValues = {
    displayName: readString(formData, "displayName").replace(/\s+/g, " "),
    city: readString(formData, "city"),
    phone: readString(formData, "phone").replace(/\s+/g, " "),
    bio: readString(formData, "bio"),
    titles: [...new Set(formData.getAll("titles").filter((v): v is string => typeof v === "string"))],
  };
  const errors: ProfileFieldErrors = {};

  if (values.displayName.length < 2 || values.displayName.length > 60) {
    errors.displayName = "Görünen ad 2–60 karakter olmalı.";
  }
  if (values.city && !isProvince(values.city)) {
    errors.city = "Listeden bir il seç.";
  }
  if (values.phone && !PHONE_PATTERN.test(values.phone)) {
    errors.phone = "Geçerli bir telefon numarası gir (örn. 0532 123 45 67).";
  }
  if (values.bio.length > MAX_BIO_LENGTH) {
    errors.bio = `Hakkında en fazla ${MAX_BIO_LENGTH} karakter olabilir.`;
  }
  if (!values.titles.every(isProfileTitle)) {
    errors.titles = "Geçersiz unvan seçimi.";
  }

  if (Object.keys(errors).length > 0) return { values, errors };

  return {
    values,
    errors,
    data: {
      display_name: values.displayName,
      city: values.city || null,
      phone: values.phone || null,
      bio: values.bio || null,
      titles: values.titles.filter(isProfileTitle),
    },
  };
}
