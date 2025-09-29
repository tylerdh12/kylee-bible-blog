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
const hasDatabase = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Database URL present: ${!!hasDatabase}`);

if (!hasDatabase && !process.env.SKIP_ENV_VALIDATION) {
	console.warn('⚠️  No database URL found. This may cause runtime errors.');
	console.warn('⚠️  Set DATABASE_URL or POSTGRES_PRISMA_URL in Vercel environment variables.');
}

try {
	// Generate Prisma client
	console.log('📦 Generating Prisma client...');
	execSync('prisma generate', { stdio: 'inherit' });
	
	// For production builds, we don't run migrations here
	// Migrations should be handled separately in deployment process
	if (isProduction) {
		console.log('✅ Production setup completed');
		console.log('⚠️  Remember to run database migrations separately');
	} else {
		console.log('✅ Development setup completed');
	}
	
} catch (error) {
	console.error('❌ Setup failed:', error.message);
	process.exit(1);
}

console.log('🎉 Vercel setup completed successfully!');
