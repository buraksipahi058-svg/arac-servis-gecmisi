import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidPlate, normalizePlate } from "@/lib/vehicles/plate";
import { hashShareCode, normalizeShareCode } from "./code";

export type ShareAccess = {
  vehicleId: string;
  expiresAt: string;
  // Normalize edilmiş değerler (çerezde saklanır, her istekte yeniden doğrulanır).
  plate: string;
  code: string;
};

// Plaka + kod doğrulaması. Başarısız her durumda (yanlış kod, yanlış plaka, süresi dolmuş,
// iptal edilmiş) aynı sonuç döner; hangi bilginin yanlış olduğu dışarı sızdırılmaz.
export async function verifyShareAccess(
  plateInput: string,
  codeInput: string,
): Promise<ShareAccess | null> {
  const plate = normalizePlate(plateInput);
  const code = normalizeShareCode(codeInput);
  if (!code || !isValidPlate(plate)) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("access_tokens")
    .select("vehicle_id, expires_at, revoked_at, vehicles!inner(plate)")
    .eq("code_hash", hashShareCode(code))
    .maybeSingle();

  if (error) throw error;
  if (
    !data ||
    data.revoked_at ||
    new Date(data.expires_at).getTime() <= Date.now() ||
    data.vehicles.plate !== plate
  ) {
    return null;
  }

  return { vehicleId: data.vehicle_id, expiresAt: data.expires_at, plate, code };
}

// Paylaşım erişim çerezi: yalnızca /shared yolunda, httpOnly.
export const SHARE_ACCESS_COOKIE = "shared_access";

export function encodeAccessCookie(access: Pick<ShareAccess, "plate" | "code">): string {
  return `${access.plate}:${access.code}`;
}

export function decodeAccessCookie(value: string): { plate: string; code: string } | null {
  const [plate, code, ...rest] = value.split(":");
  return plate && code && rest.length === 0 ? { plate, code } : null;
}
