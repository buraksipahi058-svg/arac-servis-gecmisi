import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Oturum açmış kullanıcıyı ve onun yetkisiyle çalışan Supabase client'ını döndürür.
// Oturum yoksa giriş sayfasına yönlendirir. Proxy'ye ek olarak her sunucu girişinde kullanılır.
export async function requireUser(nextPath = "/dashboard") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user };
}
