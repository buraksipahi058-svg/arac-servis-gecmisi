import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabasePublicEnv } from "./env";

// RLS'i atlayan yetkili client. YALNIZCA sunucuda ve yalnızca paylaşım görünümünde,
// plaka + kod doğrulandıktan sonra, seçilmiş (whitelist) alanları okumak için kullanılır.
// "server-only" sayesinde istemci koduna import edilirse build başarısız olur.
export function createAdminClient() {
  const { url } = getSupabasePublicEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY tanımlı olmalı (yalnızca sunucu ortamında).");
  }

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
