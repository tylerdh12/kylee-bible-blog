import type { NextConfig } from 'next';

// Security headers for production
const securityHeaders = [
	{
		key: 'X-DNS-Prefetch-Control',
		value: 'on',
	},
	{
		key: 'Strict-Transport-Security',
		value: 'max-age=63072000; includeSubDomains; preload',
	},
	{
		key: 'X-XSS-Protection',
		value: '1; mode=block',
	},
	{
		key: 'X-Frame-Options',
		value: 'SAMEORIGIN',
	},
	{
		key: 'X-Content-Type-Options',
		value: 'nosniff',
	},
	{
		key: 'Referrer-Policy',
		value: 'strict-origin-when-cross-origin',
	},
	{
		key: 'Permissions-Policy',
		value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
	},
	{
		key: 'Content-Security-Policy',
		value: [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js
			"style-src 'self' 'unsafe-inline'", // Required for Tailwind
			"img-src 'self' data: https: blob:",
			"font-src 'self' data:",
			"connect-src 'self' https:",
			"frame-ancestors 'self'",
			"base-uri 'self'",
			"form-action 'self'",
		].join('; '),
	},
];

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
		// Note: FlatCompat warning about useEslintrc/extensions is a known compatibility
		// issue between ESLint 8/9 and Next.js configs. It's harmless but treated as an error.
		// We temporarily ignore during builds, but ESLint still runs in development.
		// TODO: Remove this when Next.js/ESLint fix the compatibility issue
		ignoreDuringBuilds: true,
		dirs: ['src', 'app'],
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

	// Apply security headers to all routes
	async headers() {
		return [
			{
				// Apply security headers to all routes
				source: '/:path*',
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
