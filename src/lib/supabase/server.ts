import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isHttpsRequest } from "@/lib/request-origin";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";
import { fetchWithTimeout } from "./fetch-with-timeout";

// Server Component, Server Action ve Route Handler'lar için Supabase client'ı.
// Oturum cookie'den okunur; kullanıcı yetkisiyle çalışır (RLS geçerli).
export async function createClient() {
  const { url, publishableKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    global: { fetch: fetchWithTimeout },
    // HTTPS'te oturum çerezleri yalnızca şifreli bağlantıda gönderilir.
    cookieOptions: { secure: await isHttpsRequest() },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component'ten çağrıldığında cookie yazılamaz.
          // Oturum yenilemesini proxy üstlendiği için güvenle yok sayılabilir.
        }
      },
    },
  });
}
