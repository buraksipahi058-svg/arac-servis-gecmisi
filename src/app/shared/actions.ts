"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { encodeAccessCookie, SHARE_ACCESS_COOKIE, verifyShareAccess } from "@/lib/share/access";
import { isRateLimited, recordFailure } from "@/lib/share/rate-limit";

const SHARED_PATH = "/shared";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function clientKey(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}

export async function openSharedHistory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const key = await clientKey();
  if (isRateLimited(key)) {
    return { error: "Çok fazla hatalı deneme yapıldı. Lütfen 15 dakika sonra tekrar dene." };
  }

  const access = await verifyShareAccess(readString(formData, "plate"), readString(formData, "code"));
  if (!access) {
    recordFailure(key);
    return { error: "Plaka veya paylaşım kodu hatalı ya da kodun süresi dolmuş." };
  }

  const secondsLeft = Math.floor((new Date(access.expiresAt).getTime() - Date.now()) / 1000);
  (await cookies()).set(SHARE_ACCESS_COOKIE, encodeAccessCookie(access), {
    httpOnly: true,
    sameSite: "lax",
    path: SHARED_PATH,
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.max(secondsLeft, 0),
  });
  redirect(SHARED_PATH);
}

export async function closeSharedHistory(): Promise<void> {
  (await cookies()).delete({ name: SHARE_ACCESS_COOKIE, path: SHARED_PATH });
  redirect(SHARED_PATH);
}
