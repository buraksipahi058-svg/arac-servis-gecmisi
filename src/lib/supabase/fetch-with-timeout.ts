// Sunucu tarafı Supabase isteklerine üst süre: bir servis yanıt vermezse sayfa, API geçidinin
// kendi zaman aşımına (dakikalar) kadar asılı kalmaz; hata ekranı gösterilir.
// AbortSignal.timeout() yerine AbortController kullanılır: iptal "AbortError" olarak döner ve
// postgrest-js bu hatayı yeniden denemez (TimeoutError'ı dener, toplam süre katlanırdı).
const SERVER_REQUEST_TIMEOUT_MS = 10_000;

export const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_REQUEST_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal;
  try {
    return await fetch(input, { ...init, signal });
  } finally {
    clearTimeout(timer);
  }
};
