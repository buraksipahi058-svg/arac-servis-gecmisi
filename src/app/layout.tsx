import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Araç Servis Geçmişi",
    template: "%s · Araç Servis Geçmişi",
  },
  description: "Aracının bakım, onarım ve parça değişimi kayıtlarını tek yerde tut.",
  applicationName: "Araç Servis Geçmişi",
  // iOS'ta "Ana Ekrana Ekle" ile açıldığında başlık ve durum çubuğu.
  appleWebApp: { capable: true, title: "Servis Geçmişi", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f9fafb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
