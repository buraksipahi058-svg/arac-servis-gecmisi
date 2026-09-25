import "server-only";
import { headers } from "next/headers";

// Hatalı denemeleri (giriş, paylaşım kodu) istemci başına sınırlayan basit, bellek içi sayaç.
// Tek sunucu süreci içindir; süreç yeniden başlarsa sıfırlanır.
// İstemci anahtarı x-forwarded-for başlığından gelir (ayrıntı: getClientKey). Önünde ters vekil
// (reverse proxy) yoksa bu başlık tümüyle istemcinin elindedir.

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

// x-forwarded-for, "istemcinin yazdıkları..., vekillerin eklediği adresler" sırasıyla gelir. İlk girdiler
// istemci tarafından uydurulabilir; güvenilir olan, bizim ters vekilimizin eklediği girdidir: sondan
// TRUSTED_PROXY_HOPS'uncu (varsayılan 1 = önünde tek vekil: nginx, Caddy, Vercel). Örneğin Cloudflare + nginx
// gibi iki katmanda 2 olmalıdır.
function trustedProxyHops(): number {
  const hops = Number(process.env.TRUSTED_PROXY_HOPS ?? "1");
  return Number.isInteger(hops) && hops >= 1 ? hops : 1;
}

export async function getClientKey(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = (requestHeaders.get("x-forwarded-for") ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return (
    forwarded[Math.max(0, forwarded.length - trustedProxyHops())] ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}
