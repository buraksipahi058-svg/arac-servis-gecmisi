"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createFailureLimiter, getClientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";

export type AuthFormState = {
  error?: string;
  message?: string;
  email?: string;
};

const MIN_PASSWORD_LENGTH = 8;
// Hatalı giriş: aynı istemciden aynı hesaba 15 dakikada 10 deneme.
// (Auth sunucusunun kendi IP sınırı, istekler Next sunucusundan geldiği için kullanıcı ayırt edemez.)
const loginLimiter = createFailureLimiter({ windowMs: 15 * 60 * 1000, maxFailures: 10 });
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "E-posta veya şifre hatalı.";
    case "email_not_confirmed":
      return "E-posta adresin henüz doğrulanmamış. Gelen kutunu kontrol et.";
    case "user_already_exists":
    case "email_exists":
      return "Bu e-posta adresiyle zaten bir hesap var.";
    case "weak_password":
      return `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı.`;
    case "email_address_invalid":
      return "Geçerli bir e-posta adresi gir.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Çok fazla deneme yapıldı. Biraz sonra tekrar dene.";
    case "signup_disabled":
      return "Şu anda yeni kayıt alınmıyor.";
    default:
      return "Bir hata oluştu. Lütfen tekrar dene.";
  }
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readString(formData, "email").trim();
  const password = readString(formData, "password");
  const nextPath = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "E-posta ve şifre gerekli.", email };
  }

  const limiterKey = `${await getClientKey()}|${email.toLowerCase()}`;
  if (loginLimiter.isLimited(limiterKey)) {
    return { error: "Çok fazla hatalı giriş denemesi. Lütfen 15 dakika sonra tekrar dene.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "invalid_credentials") loginLimiter.recordFailure(limiterKey);
    return { error: authErrorMessage(error.code), email };
  }

  revalidatePath("/", "layout");
  redirect(nextPath);
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readString(formData, "email").trim();
  const password = readString(formData, "password");
  const passwordConfirm = readString(formData, "passwordConfirm");

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Geçerli bir e-posta adresi gir.", email };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı.`, email };
  }
  if (password !== passwordConfirm) {
    return { error: "Şifreler eşleşmiyor.", email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: authErrorMessage(error.code), email };
  }

  // E-posta doğrulaması açıksa oturum hemen oluşmaz.
  if (!data.session) {
    return {
      message:
        "Hesabın oluşturuldu. E-posta adresine gönderilen bağlantıyla doğruladıktan sonra giriş yapabilirsin.",
      email,
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  // Yalnızca bu cihazdaki oturumu kapatır.
  await supabase.auth.signOut({ scope: "local" });

  revalidatePath("/", "layout");
  redirect("/login");
}
