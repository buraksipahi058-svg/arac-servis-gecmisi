import "server-only";

// Hatalı plaka/kod denemelerini istemci başına sınırlar (bellek içi, tek sunucu süreci).
// Not: İstemci anahtarı x-forwarded-for başlığından gelir; önünde güvenilir bir ters vekil
// (reverse proxy) yoksa bu başlık istemci tarafından değiştirilebilir.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;

const failuresByClient = new Map<string, number[]>();

function recentFailures(clientKey: string, now: number): number[] {
  const recent = (failuresByClient.get(clientKey) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length === 0) failuresByClient.delete(clientKey);
  else failuresByClient.set(clientKey, recent);
  return recent;
}

export function isRateLimited(clientKey: string): boolean {
  return recentFailures(clientKey, Date.now()).length >= MAX_FAILURES;
}

export function recordFailure(clientKey: string): void {
  const now = Date.now();
  failuresByClient.set(clientKey, [...recentFailures(clientKey, now), now]);
}
