"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { formatShareCode, generateShareCode, hashShareCode } from "@/lib/share/code";
import { isUuid } from "@/lib/uuid";

export type CreateShareCodeState = {
  // Kod yalnızca bu yanıtta, bir kez döner; hiçbir yerde düz metin saklanmaz.
  code?: string;
  expiresAt?: string;
  error?: string;
};

const MAX_ATTEMPTS = 3;

function sharePath(vehicleId: string) {
  return `/dashboard/vehicles/${vehicleId}/share`;
}

export async function createShareCode(
  vehicleId: string,
  _prevState: CreateShareCodeState,
): Promise<CreateShareCodeState> {
  if (!isUuid(vehicleId)) return { error: "Araç bulunamadı." };
  const { supabase } = await requireUser(sharePath(vehicleId));

  // Hash çakışması (çok düşük olasılık) halinde yeni kodla tekrar denenir.
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateShareCode();
    const { data, error } = await supabase
      .from("access_tokens")
      .insert({ vehicle_id: vehicleId, code_hash: hashShareCode(code) })
      .select("expires_at")
      .single();

    if (!error) {
      revalidatePath(sharePath(vehicleId));
      return { code: formatShareCode(code), expiresAt: data.expires_at };
    }
    if (error.code === "42501") return { error: "Araç bulunamadı." };
    if (error.code !== "23505") {
      console.error("Paylaşım kodu oluşturulamadı:", error.code, error.message);
      break;
    }
  }

  return { error: "Paylaşım kodu oluşturulamadı. Lütfen tekrar dene." };
}

export async function revokeShareCode(
  vehicleId: string,
  tokenId: string,
  _prevState: ActionState,
): Promise<ActionState> {
  const notFound = { error: "Paylaşım kodu bulunamadı veya zaten iptal edilmiş." };
  if (!isUuid(vehicleId) || !isUuid(tokenId)) return notFound;

  const { supabase } = await requireUser(sharePath(vehicleId));
  const { data, error } = await supabase
    .from("access_tokens")
    // İptal zamanını DB trigger'ı now() ile belirler.
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", tokenId)
    .eq("vehicle_id", vehicleId)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Paylaşım kodu iptal edilemedi:", error.code, error.message);
    return { error: "Paylaşım kodu iptal edilemedi. Lütfen tekrar dene." };
  }
  if (!data) return notFound;

  revalidatePath(sharePath(vehicleId));
  return {};
}
