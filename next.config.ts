import type { NextConfig } from "next";

// Tüm yanıtlara eklenen güvenlik başlıkları.
const securityHeaders = [
  // Başka sitelerin sayfaları iframe içine alması engellenir (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Dev sunucusuna LAN üzerinden (host IP'si ile) erişim.
  allowedDevOrigins: ["192.168.1.13"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
