// apps/storefront/next.config.js
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // any experimental flags here
  },
  // turbopack: {}, // Desactivado temporalmente para probar memory issue
  logging: {
    fetches: {
      fullUrl: true,
    },
  }, // Restaurado después de actualizar Next.js
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
