import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Définir explicitement la racine du workspace pour éviter l'avertissement des lockfiles multiples
  outputFileTracingRoot: path.join(__dirname),
  
  // Désactiver ESLint pendant le build pour éviter les warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ichxgtlkrkjtcdkspmgu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  webpack: (config, { isServer }) => {
    config.cache = false;

    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
