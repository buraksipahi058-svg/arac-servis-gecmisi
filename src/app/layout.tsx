import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// latin-ext: Türkçe karakterler (ş, ğ, ı, İ, ç, ö, ü).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Araç Servis Geçmişi",
    template: "%s · Araç Servis Geçmişi",
  },
  description: "Aracının bakım, onarım ve parça değişimi kayıtlarını tek yerde tut.",
  applicationName: "Araç Servis Geçmişi",
  // iOS'ta "Ana Ekrana Ekle" ile açıldığında başlık ve durum çubuğu.
  appleWebApp: { capable: true, title: "Servis Geçmişi", statusBarStyle: "black" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#121c2d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
