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
		ignoreDuringBuilds: false,
	},
	typescript: {
		ignoreBuildErrors: false,
	},
	outputFileTracingIncludes: {
		'/api/**/*': ['./prisma/**/*'],
	},
	experimental: {
		// Optimize build performance
		optimizePackageImports: [
			'lucide-react',
			'@radix-ui/react-avatar',
			'@radix-ui/react-dialog',
		],
	},
	// Webpack config is needed for production builds (npm run build)
	// Turbopack (used in dev mode with --turbopack flag) automatically ignores this config
	// The warning about webpack + Turbopack is expected and harmless - Turbopack will use its own bundler
	webpack: (config, { isServer, dev }) => {
		// Optimize for production builds (webpack, not Turbopack)
		if (!dev && !isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
				crypto: false,
				stream: false,
				util: false,
			};
		}

		// Reduce memory usage during build
		config.optimization = {
			...config.optimization,
			moduleIds: 'deterministic',
		};

		return config;
	},
	poweredByHeader: false,
};

export default nextConfig;
