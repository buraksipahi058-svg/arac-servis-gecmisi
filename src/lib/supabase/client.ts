import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

// Tarayıcı tarafı (Client Component) için Supabase client'ı.
// Yalnızca publishable key kullanır; erişim RLS ile sınırlanır.
export function createClient() {
  const { url, publishableKey } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
