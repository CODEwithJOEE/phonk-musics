import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { RangeRequestsPlugin } from "workbox-range-requests";
import { clientsClaim } from "workbox-core";

// Take control on first load
self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ---- Audio: full offline support with seeking -----------------------------
registerRoute(
  ({ url }) => url.pathname.startsWith("/music-phonk/"),
  new CacheFirst({
    cacheName: "phonk-audio-v1",
    plugins: [
      {
        // Never poison the cache with 206 partial responses.
        // Full responses (200) come from warmAudioCache() in the app.
        cacheWillUpdate: async ({ response }) => {
          if (response && response.status === 200) return response;
          return null;
        },
      },
      new RangeRequestsPlugin(),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 365,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// ---- Cover art ------------------------------------------------------------
registerRoute(
  ({ url }) => url.pathname.startsWith("/images/"),
  new CacheFirst({
    cacheName: "phonk-covers-v1",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 180,
      }),
    ],
  }),
);

// ---- SPA navigation fallback ---------------------------------------------
const navHandler = createHandlerBoundToURL("/index.html");
registerRoute(
  new NavigationRoute(navHandler, {
    denylist: [/^\/music-phonk\//, /^\/images\//],
  }),
);
