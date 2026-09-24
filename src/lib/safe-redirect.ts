const DEFAULT_REDIRECT = "/dashboard";
const INTERNAL_ORIGIN = "http://internal.invalid";

// Açık yönlendirmeyi (open redirect) önler: yalnızca /dashboard altındaki site içi yollar.
// Tarayıcılar sekme/satır sonu karakterlerini yoksayar ("/\t/evil.com" → "//evil.com"),
// bu yüzden kontrol karakterleri ve ters eğik çizgi içeren değerler doğrudan reddedilir.
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) return DEFAULT_REDIRECT;
  if (/[\u0000-\u001F\u007F\\]/.test(value)) return DEFAULT_REDIRECT;

  let url: URL;
  try {
    url = new URL(value, INTERNAL_ORIGIN);
  } catch {
    return DEFAULT_REDIRECT;
  }
  if (url.origin !== INTERNAL_ORIGIN) return DEFAULT_REDIRECT;
  if (url.pathname !== "/dashboard" && !url.pathname.startsWith("/dashboard/")) {
    return DEFAULT_REDIRECT;
  }
  return `${url.pathname}${url.search}`;
}
