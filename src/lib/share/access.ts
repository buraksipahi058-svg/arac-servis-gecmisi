import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient, getSecretKey } from "@/lib/supabase/admin";
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

// Paylaşım erişim çerezi: yalnızca /shared yolunda, httpOnly. Plaka ve kod, sunucunun gizli anahtarından
// türetilen bir anahtarla imzalanır. Elle yazılmış (imzasız) bir çerez veritabanına sorulmadan reddedilir;
// böylece çerez, formdaki deneme sınırını atlatıp kod denemek için kullanılamaz.
export const SHARE_ACCESS_COOKIE = "shared_access";

function signAccess(payload: string): Buffer {
  const key = createHmac("sha256", getSecretKey()).update("share-access-cookie").digest();
  return createHmac("sha256", key).update(payload).digest();
}

export function encodeAccessCookie(access: Pick<ShareAccess, "plate" | "code">): string {
  const payload = `${access.plate}:${access.code}`;
  return `${payload}:${signAccess(payload).toString("base64url")}`;
}

export function decodeAccessCookie(value: string): { plate: string; code: string } | null {
  const [plate, code, signature, ...rest] = value.split(":");
  if (!plate || !code || !signature || rest.length > 0) return null;
  const expected = signAccess(`${plate}:${code}`);
  const given = Buffer.from(signature, "base64url");
  return given.length === expected.length && timingSafeEqual(given, expected) ? { plate, code } : null;
}
