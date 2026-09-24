import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ShareTokenStatus = "active" | "expired" | "revoked";

export type ShareToken = {
  id: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  status: ShareTokenStatus;
};

const MAX_LISTED_TOKENS = 20;

// Aracın paylaşım kodları (en yeni önce). Hash sütunu seçilmez; okuma yetkisi de yoktur.
export async function listShareTokens(vehicleId: string): Promise<ShareToken[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("access_tokens")
    .select("id, created_at, expires_at, revoked_at")
    .eq("vehicle_id", vehicleId)
    .order("created_at", { ascending: false })
    .limit(MAX_LISTED_TOKENS);

  if (error) throw error;

  const now = Date.now();
  return data.map((token) => ({
    id: token.id,
    createdAt: token.created_at,
    expiresAt: token.expires_at,
    revokedAt: token.revoked_at,
    status: token.revoked_at
      ? "revoked"
      : new Date(token.expires_at).getTime() <= now
        ? "expired"
        : "active",
  }));
}
