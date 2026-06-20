import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kan Elis äta detta?",
    short_name: "Elis-koll",
    description:
      "Hjälper familjen avgöra om en produkt är säker för Elis som har celiaki.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e6f5f1",
    theme_color: "#0B7E73",
    lang: "sv",
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
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
