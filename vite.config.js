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
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // 1. INCREASE CACHE LIMIT: Audio files are large. Workbox ignores files > 2MB by default.
        maximumFileSizeToCacheInBytes: 150 * 1024 * 1024, // 150MB allowance

        // 2. FORCE PRECACHING: Tells the app to download all audio/images straight away
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg}",
          "music-phonk/**/*.{mp3,wav}",
          "images/**/*.{jpg,jpeg,png}",
        ],

        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/music-phonk/"),
            handler: "CacheFirst",
            options: {
              cacheName: "phonk-audio",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
              cacheableResponse: { statuses: [0, 200, 206] },
              rangeRequests: true, // Crucial for Safari and media scrubbing
            },
          },
        ],
      },
    }),
  ],
});
