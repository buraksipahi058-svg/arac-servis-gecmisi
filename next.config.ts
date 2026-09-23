import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev sunucusuna LAN üzerinden (host IP'si ile) erişim.
  allowedDevOrigins: ["192.168.1.13"],
};

export default nextConfig;
