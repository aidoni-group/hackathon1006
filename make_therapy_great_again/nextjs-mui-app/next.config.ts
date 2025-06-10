import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'brief-closing-louse.ngrok-free.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
