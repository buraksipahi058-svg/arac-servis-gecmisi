import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Tarayıcının doğrudan bağlandığı Supabase adresi: belge yükleme (Storage), oturum yenileme ve
// belge görselleri (signed URL). Next, .env dosyalarını bu dosyadan önce yükler.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL tanımlı olmalı (.env.example dosyasına bak).");
}
const supabaseOrigin = new URL(supabaseUrl).origin;

// Nonce'suz CSP (Next dokümanı: guides/content-security-policy, "Without Nonces"). Next'in satır içi
// betikleri için 'unsafe-inline' gerekir; dış kaynaklı betik, eklenti (object), başka adrese form gönderimi,
// <base> değiştirme ve iframe içine alınma engellenir; bağlantılar yalnızca uygulama ve Supabase'e açıktır.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${supabaseOrigin}`,
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Tüm yanıtlara eklenen güvenlik başlıkları.
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Eski tarayıcılar için (yenilerde CSP frame-ancestors geçerli): clickjacking koruması.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // HTTPS'te tarayıcı siteye 2 yıl boyunca yalnızca HTTPS ile gider (HTTP yanıtlarında tarayıcı yok sayar).
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  // Dev sunucusuna LAN üzerinden (host IP'si ile) erişim.
  allowedDevOrigins: ["192.168.1.13"],
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Başka sitelerin açtığı pencerelerle (window.opener) bağ kurulmaz. Yalnızca HTTPS'te geçerli olduğundan
      // (HTTP'de tarayıcı yok sayıp konsola hata yazar) ters vekilin X-Forwarded-Proto: https isteklerinde eklenir.
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "https" }],
        headers: [{ key: "Cross-Origin-Opener-Policy", value: "same-origin" }],
      },
    ];
  },
};

export default nextConfig;
