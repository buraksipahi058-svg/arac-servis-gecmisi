import type { EmailOtpType } from "@supabase/supabase-js";

// E-postadaki doğrulama bağlantısının kabul edilen türleri (şablon "email" gönderir).
const CONFIRMATION_TYPES: readonly EmailOtpType[] = ["email", "signup"];

export function isConfirmationType(value: unknown): value is EmailOtpType {
  return typeof value === "string" && CONFIRMATION_TYPES.includes(value as EmailOtpType);
}
