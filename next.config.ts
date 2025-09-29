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
	poweredByHeader: false,
};

export default nextConfig;
