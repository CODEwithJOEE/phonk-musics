import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // Only real files that exist in /public.
      includeAssets: ["favicon.ico", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Phonk Hub",
        short_name: "PhonkHub",
        description: "Curated Underground Phonk Beats",
        theme_color: "#0b0b0b",
        background_color: "#0b0b0b",
        display: "standalone", // Opens in a clean, app-like window when installed
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
            purpose: "maskable", // Lets phones shape the icon (circle/squircle/etc.)
          },
        ],
      },
      workbox: {
        // App shell (JS/CSS/HTML) is precached automatically.
        runtimeCaching: [
          {
            // Album art: cache-first, since covers never change once shipped.
            urlPattern: ({ url }) => url.pathname.startsWith("/images/"),
            handler: "CacheFirst",
            options: {
              cacheName: "phonk-images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Audio: cache-first with range-request support so seeking/
            // scrubbing works correctly on cached (offline) tracks.
            urlPattern: ({ url }) => url.pathname.startsWith("/music-phonk/"),
            handler: "CacheFirst",
            options: {
              cacheName: "phonk-audio",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
              },
              // FIXED: Added 206 to status codes to support storing partial content chunks
              cacheableResponse: { statuses: [0, 200, 206] },
              rangeRequests: true,
            },
          },
        ],
      },
    }),
  ],
});
