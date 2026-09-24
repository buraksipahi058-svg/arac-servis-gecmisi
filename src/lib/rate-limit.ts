import "server-only";
import { headers } from "next/headers";

// Hatalı denemeleri (giriş, paylaşım kodu) istemci başına sınırlayan basit, bellek içi sayaç.
// Tek sunucu süreci içindir; süreç yeniden başlarsa sıfırlanır.
// İstemci anahtarı x-forwarded-for başlığından gelir: önünde bu başlığı kendisi yazan güvenilir
// bir ters vekil (reverse proxy) yoksa istemci tarafından değiştirilebilir.

const MAX_TRACKED_KEYS = 10_000;

export type FailureLimiter = {
  isLimited: (key: string) => boolean;
  recordFailure: (key: string) => void;
};

export function createFailureLimiter(options: { windowMs: number; maxFailures: number }): FailureLimiter {
  const failuresByKey = new Map<string, number[]>();

  function recent(key: string, now: number): number[] {
    const times = (failuresByKey.get(key) ?? []).filter((time) => now - time < options.windowMs);
    if (times.length === 0) failuresByKey.delete(key);
    else failuresByKey.set(key, times);
    return times;
  }

  // Çok sayıda farklı anahtarla belleğin şişirilmesini önler.
  function enforceMemoryBound(now: number) {
    if (failuresByKey.size <= MAX_TRACKED_KEYS) return;
    for (const key of failuresByKey.keys()) recent(key, now);
    for (const key of failuresByKey.keys()) {
      if (failuresByKey.size <= MAX_TRACKED_KEYS) break;
      failuresByKey.delete(key); // en eski eklenen önce
    }
  }

  return {
    isLimited(key) {
      return recent(key, Date.now()).length >= options.maxFailures;
    },
    recordFailure(key) {
      const now = Date.now();
      failuresByKey.set(key, [...recent(key, now), now]);
      enforceMemoryBound(now);
    },
  };
}

export async function getClientKey(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}
