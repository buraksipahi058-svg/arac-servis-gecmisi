import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

// Server Component, Server Action ve Route Handler'lar için Supabase client'ı.
// Oturum cookie'den okunur; kullanıcı yetkisiyle çalışır (RLS geçerli).
export async function createClient() {
  const { url, publishableKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
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
