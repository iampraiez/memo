const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Rule B + C: clientsClaim ensures the new SW immediately controls all open tabs
  // after skipWaiting activates it — without this, the fetch handler never fires.
  clientsClaim: true,
  disable: process.env.NODE_ENV === "development",
  // Rule B + E: offline fallback document for when network fails and page isn't cached
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    {
      // Rule D+E: document navigation requests — NetworkFirst with offline fallback
      // Must be FIRST (most specific routes before generic ones per Rule B)
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 3, // Rule D: timeout before falling back to cache
        expiration: {
          maxEntries: 50,
        },
      },
    },
    {
      // Rule D: CacheFirst for remote images (long-lived, rarely changes)
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "cloudinary-images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      // Rule D: StaleWhileRevalidate for static assets
      urlPattern: /\.(?:js|css|json|png|jpg|jpeg|svg|gif|webp)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // turbopack: {} — needed for `next dev` in Next.js 16 (Turbopack is the default).
  // next-pwa is disabled in dev (see above), so no webpack conflict exists in dev.
  // Production build uses `next build --webpack` (see package.json) so next-pwa
  // can generate sw.js correctly via its webpack plugin.
  turbopack: {},

  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "lucide-react"],
  },

  compress: true,

  async rewrites() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
      },
      {
        source: "/register",
        destination: "/auth/register",
      },
      {
        source: "/forgot-password",
        destination: "/auth/forgot-password",
      },
    ];
  },

  productionBrowserSourceMaps: false,
};

module.exports = withPWA(nextConfig);
