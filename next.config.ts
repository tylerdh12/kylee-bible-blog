import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	serverExternalPackages: [
		'prisma',
		'@prisma/client',
		'jsdom',
		'@exodus/bytes',
		'html-encoding-sniffer',
		'isomorphic-dompurify',
	],
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
	outputFileTracingExcludes: {
		'*': [
			'**/node_modules/jsdom/**',
			'**/node_modules/@exodus/bytes/**',
			'**/node_modules/html-encoding-sniffer/**',
			'**/node_modules/jest-environment-jsdom/**',
		],
	},
	experimental: {
		// Optimize build performance
		optimizePackageImports: [
			'lucide-react',
			'@radix-ui/react-avatar',
			'@radix-ui/react-dialog',
		],
		// Disable ESM externals to treat external modules as CommonJS
		// This fixes compatibility issues with jsdom and isomorphic-dompurify
		esmExternals: false,
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

		// Externalize jsdom and related packages for server-side builds
		// This prevents ESM/CommonJS compatibility issues in production
		// Note: serverExternalPackages above also handles this, but this adds extra safety
		if (isServer) {
			const externals = config.externals || [];
			if (Array.isArray(externals)) {
				config.externals = [
					...externals,
					/^jsdom$/,
					/^@exodus\/bytes/,
					/^html-encoding-sniffer/,
					/^isomorphic-dompurify/,
				];
			} else if (typeof externals === 'function') {
				const originalExternals = externals;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				config.externals = (
					context: any,
					request: any,
					callback: any
				) => {
					if (
						/^jsdom$/.test(request) ||
						/^@exodus\/bytes/.test(request) ||
						/^html-encoding-sniffer/.test(request) ||
						/^isomorphic-dompurify/.test(request)
					) {
						return callback(null, `commonjs ${request}`);
					}
					return originalExternals(
						context,
						request,
						callback
					);
				};
			}
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
