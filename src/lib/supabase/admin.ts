import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";
import { fetchWithTimeout } from "./fetch-with-timeout";

// RLS'i atlayan yetkili client. YALNIZCA sunucuda ve yalnızca paylaşım görünümünde,
// plaka + kod doğrulandıktan sonra, seçilmiş (whitelist) alanları okumak için kullanılır.
// "server-only" sayesinde istemci koduna import edilirse build başarısız olur.
export function getSecretKey(): string {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY tanımlı olmalı (yalnızca sunucu ortamında).");
  }
  return secretKey;
}

export function createAdminClient() {
  const { url } = getSupabasePublicEnv();

  return createClient<Database>(url, getSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: fetchWithTimeout },
  });
}
