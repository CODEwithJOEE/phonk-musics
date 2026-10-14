import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // Include your main UI assets here
      includeAssets: [
        "favicon.ico",
        "icons/apple-touch-icon.png",
        "background-image.png",
      ],
      manifest: {
        name: "Phonk Hub",
        short_name: "PhonkHub",
        description: "Curated Underground Phonk Beats",
        theme_color: "#0b0b0b",
        background_color: "#0b0b0b",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "icons/phonk-logo-transparent.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/phonk-logo-transparent.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/phonk-logo-transparent.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB — only small assets
        globPatterns: ["**/*.{js,css,html,ico,svg}"],
        // Don't precache music — let runtime caching handle it on demand
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/music-phonk/"),
            handler: "CacheFirst",
            options: {
              cacheName: "phonk-audio-v1",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90,
                purgeOnQuotaError: true,
              },
              cacheableResponse: { statuses: [0, 200, 206] },
              rangeRequests: true,
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/images/"),
            handler: "CacheFirst",
            options: {
              cacheName: "phonk-covers-v1",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 180,
              },
            },
          },
        ],
      },
    }),
  ],
});
