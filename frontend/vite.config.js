import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "maskable-icon-512x512.png"
      ],
      manifest: {
        id: "/",
        name: "Aarogyam — Unified Health Identity",
        short_name: "Aarogyam",
        description: "Universal digital health records and universal health identity platform.",
        theme_color: "#1b4332",
        background_color: "#faf5ec",
        display: "standalone",
        display_override: ["standalone", "window-controls-overlay"],
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        categories: ["medical", "health", "lifestyle"],
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        shortcuts: [
          {
            name: "Patient Records",
            short_name: "Patient",
            description: "Access your patient health records",
            url: "/patient/overview",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Doctor Portal",
            short_name: "Doctor",
            description: "Doctor dashboard and consultations",
            url: "/doctor/overview",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Scan Patient QR",
            short_name: "Scan QR",
            description: "Scan a patient Aarogyam QR card",
            url: "/doctor/create-visit",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }]
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  }
});

