import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AgriSmart TJ",
    short_name: "AgriSmart",
    description:
      "ИИ-помощник для фермеров Таджикистана: полив, диагностика растений, погода и маркет.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#16a34a",
    background_color: "#ffffff",
    categories: ["agriculture", "productivity", "utilities"],
    lang: "ru",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/pwa-preview.png",
        sizes: "1200x800",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };
}
