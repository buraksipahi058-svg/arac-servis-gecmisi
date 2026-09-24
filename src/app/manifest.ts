import type { MetadataRoute } from "next";

// Telefonda "Ana ekrana ekle" için web uygulaması tanımı (çevrimdışı çalışma yok).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Araç Servis Geçmişi",
    short_name: "Servis Geçmişi",
    description: "Aracının bakım, onarım ve parça değişimi kayıtlarını tek yerde tut.",
    lang: "tr",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#f9fafb",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
