import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.gohb.com.mx" },
      { protocol: "https", hostname: "www.organicohotelboutique.com" },
      { protocol: "https", hostname: "www.organicohotelboutiquetepoz.com" },
      { protocol: "https", hostname: "www.organicohotelboutiquevalle.com" },
      { protocol: "https", hostname: "www.centroculturalquintasoledad.com" },
      { protocol: "https", hostname: "www.frontera49.com" },
      { protocol: "https", hostname: "www.origencentroholisticoyspa.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
