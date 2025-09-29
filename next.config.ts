import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	serverExternalPackages: ['prisma', '@prisma/client'],
	images: {
		domains: ['localhost'],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	outputFileTracingIncludes: {
		'/api/**/*': ['./prisma/**/*'],
	},
	webpack: (config, { isServer }) => {
		// Fix for PostCSS issues in Vercel
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
				crypto: false,
			};
		}
		return config;
	},
	poweredByHeader: false,
};

export default nextConfig;
