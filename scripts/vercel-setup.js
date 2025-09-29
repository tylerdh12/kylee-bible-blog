#!/usr/bin/env node

/**
 * Vercel-specific setup script
 * Handles database setup and migrations for production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel setup...');

// Environment check
const isProduction = process.env.NODE_ENV === 'production';
const hasDatabase = process.env.DATABASE_URL;

console.log(
	`Environment: ${
		isProduction ? 'Production' : 'Development'
	}`
);
console.log(`Database URL present: ${!!hasDatabase}`);

if (!hasDatabase && !process.env.SKIP_ENV_VALIDATION) {
	console.warn(
		'⚠️  No database URL found. This may cause runtime errors.'
	);
	console.warn(
		'⚠️  Set DATABASE_URL in Vercel environment variables.'
	);
}

try {
	// Generate Prisma client with timeout and memory optimizations
	console.log('📦 Generating Prisma client...');

	// Set environment variables for Prisma generation
	process.env.PRISMA_GENERATE_SKIP_AUTOINSTALL = 'true';
	process.env.PRISMA_ENGINES_MIRROR =
		'https://binaries.prisma.sh';

	execSync('prisma generate --no-engine', {
		stdio: 'inherit',
		timeout: 120000, // 2 minute timeout
		env: {
			...process.env,
			NODE_OPTIONS: '--max-old-space-size=4096',
		},
	});

	// For production builds, we don't run migrations here
	// Migrations should be handled separately in deployment process
	if (isProduction) {
		console.log('✅ Production setup completed');
		console.log(
			'⚠️  Remember to run database migrations separately'
		);
	} else {
		console.log('✅ Development setup completed');
	}
} catch (error) {
	console.error('❌ Setup failed:', error.message);

	// Try fallback without --no-engine flag
	try {
		console.log(
			'🔄 Retrying Prisma generation without --no-engine...'
		);
		execSync('prisma generate', {
			stdio: 'inherit',
			timeout: 180000, // 3 minute timeout
			env: {
				...process.env,
				NODE_OPTIONS: '--max-old-space-size=4096',
			},
		});
		console.log('✅ Fallback generation succeeded');
	} catch (fallbackError) {
		console.error(
			'❌ Fallback also failed:',
			fallbackError.message
		);
		process.exit(1);
	}
}

console.log('🎉 Vercel setup completed successfully!');
