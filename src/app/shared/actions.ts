"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { encodeAccessCookie, SHARE_ACCESS_COOKIE, verifyShareAccess } from "@/lib/share/access";
import { createFailureLimiter, getClientKey } from "@/lib/rate-limit";
import { isHttpsRequest } from "@/lib/request-origin";

const SHARED_PATH = "/shared";
// Hatalı plaka/kod denemesi: istemci başına 15 dakikada 10.
const shareLimiter = createFailureLimiter({ windowMs: 15 * 60 * 1000, maxFailures: 10 });

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function openSharedHistory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const key = await getClientKey();
  if (shareLimiter.isLimited(key)) {
    return { error: "Çok fazla hatalı deneme yapıldı. Lütfen 15 dakika sonra tekrar dene." };
  }

  const access = await verifyShareAccess(readString(formData, "plate"), readString(formData, "code"));
  if (!access) {
    shareLimiter.recordFailure(key);
    return { error: "Plaka veya paylaşım kodu hatalı ya da kodun süresi dolmuş." };
  }

  const secondsLeft = Math.floor((new Date(access.expiresAt).getTime() - Date.now()) / 1000);
  (await cookies()).set(SHARE_ACCESS_COOKIE, encodeAccessCookie(access), {
    httpOnly: true,
    sameSite: "lax",
    path: SHARED_PATH,
    // HTTPS'te güvenli çerez; yerel ağda düz HTTP ile de çalışır.
    secure: await isHttpsRequest(),
    maxAge: Math.max(secondsLeft, 0),
  });
  redirect(SHARED_PATH);
}

export async function closeSharedHistory(): Promise<void> {
  (await cookies()).delete({ name: SHARE_ACCESS_COOKIE, path: SHARED_PATH });
  redirect(SHARED_PATH);
}
