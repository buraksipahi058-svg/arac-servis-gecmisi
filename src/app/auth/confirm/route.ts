import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";

// Doğrulama e-postasındaki bağlantı buraya gelir (supabase/templates/confirmation.html).
// token_hash ile doğrulama, bağlantı başka bir cihazda/tarayıcıda açılsa da çalışır.
const CONFIRMATION_TYPES: readonly EmailOtpType[] = ["email", "signup"];

function isConfirmationType(value: string | null): value is EmailOtpType {
  return value !== null && CONFIRMATION_TYPES.includes(value as EmailOtpType);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (tokenHash && isConfirmationType(type)) {
    const supabase = await createClient();
    // Başarılı doğrulama oturumu da açar (çerezler yanıta yazılır).
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const next = safeNextPath(searchParams.get("next"));
      redirect(`${next}${next.includes("?") ? "&" : "?"}dogrulandi=1`);
    }
  }

  redirect("/login?dogrulama=gecersiz");
}
