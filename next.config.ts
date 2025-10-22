import { withSentryConfig } from '@sentry/nextjs';
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
	experimental: {
		// Optimize build performance
		optimizePackageImports: [
			'lucide-react',
			'@radix-ui/react-avatar',
			'@radix-ui/react-dialog',
		],
	},
	webpack: (config, { isServer, dev }) => {
		// Optimize for Vercel builds
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

// Sentry configuration options
const sentryWebpackPluginOptions = {
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options

	// Suppresses source map uploading logs during build
	silent: true,
	org: 'tyler-harper',
	project: 'kylee-blog',
};

// Export the config wrapped with Sentry
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
