import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['prisma', '@prisma/client'],
  images: {
    domains: ['localhost'],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/**/*'],
  },
};

export default nextConfig;
