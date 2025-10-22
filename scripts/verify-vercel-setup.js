#!/usr/bin/env node

/**
 * Vercel Production Setup Verification Script
 * Validates all configuration for Vercel deployment
 */

const { PrismaClient } = require('@prisma/client');

console.log('🔍 Vercel Production Setup Verification\n');

// Check if we're running in the right environment
console.log('📦 Environment Check:');
console.log(`   Node.js: ${process.version}`);
console.log(
	`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`
);
console.log(`   Platform: ${process.platform}`);
console.log();

// Required environment variables for Vercel
const JWT_DESC = 'JWT signing key (32+ chars)';
const NEXTAUTH_DESC = 'NextAuth key (32+ chars)';

const requiredVars = {
	DATABASE_URL: 'PostgreSQL connection string',
	JWT_SECRET: JWT_DESC,
	NEXTAUTH_SECRET: NEXTAUTH_DESC,
	NEXTAUTH_URL: 'Your deployed app URL',
};

// Admin setup variables
const adminVars = {
	ALLOW_ADMIN_SETUP: 'Enable admin setup in production',
	ADMIN_SETUP_KEY: 'Custom setup key (optional)',
};

console.log('✅ Required Environment Variables:');
let hasAllRequired = true;
let warnings = [];

Object.entries(requiredVars).forEach(
	([varName, description]) => {
		const value = process.env[varName];
		if (value) {
			if (varName.includes('SECRET')) {
				const masked =
					value.length > 10
						? value.substring(0, 6) +
						  '***' +
						  value.substring(value.length - 4)
						: '***';
				console.log(
					`   ✅ ${varName}: ${masked} (${value.length} chars)`
				);

				if (value.length < 32) {
					warnings.push(
						`${varName} should be at least 32 characters for security`
					);
				}
			} else if (varName.includes('URL')) {
				// Validate URL format
				try {
					const url = new URL(value);
					if (varName === 'DATABASE_URL') {
						console.log(
							`   ✅ ${varName}: ${url.protocol}//${
								url.hostname
							}:${url.port}/${url.pathname.substring(1)} (${
								value.length
							} chars)`
						);

						if (!url.protocol.startsWith('postgres')) {
							warnings.push(
								'DATABASE_URL should use postgresql:// protocol'
							);
						}
						if (
							!url.searchParams.get('sslmode') &&
							!value.includes('sslmode=require')
						) {
							warnings.push(
								'DATABASE_URL should include sslmode=require for security'
							);
						}
					} else {
						console.log(`   ✅ ${varName}: ${value}`);
					}
				} catch (error) {
					console.log(
						`   ❌ ${varName}: Invalid URL format`
					);
					hasAllRequired = false;
				}
			} else {
				console.log(`   ✅ ${varName}: ${value}`);
			}
		} else {
			console.log(
				`   ❌ ${varName}: NOT SET - ${description}`
			);
			hasAllRequired = false;
		}
	}
);

console.log('\n📋 Admin Setup Variables:');
Object.entries(adminVars).forEach(
	([varName, description]) => {
		const value = process.env[varName];
		if (value) {
			console.log(`   ✅ ${varName}: ${value}`);
		} else {
			console.log(
				`   ⭕ ${varName}: (not set) - ${description}`
			);
		}
	}
);

// Database connection test
console.log('\n🗄️  Database Connection Test:');
async function testDatabase() {
	const dbUrl = process.env.DATABASE_URL;

	if (!dbUrl) {
		console.log('   ❌ No database URL configured');
		return false;
	}

	try {
		console.log('   🔄 Creating Prisma client...');
		const prisma = new PrismaClient({
			log: ['error'],
			datasourceUrl: dbUrl,
		});

		console.log('   🔄 Testing basic connection...');
		const startTime = Date.now();

		// Test basic connection with timeout
		const connectionTest = Promise.race([
			prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`,
			new Promise((_, reject) =>
				setTimeout(
					() =>
						reject(
							new Error(
								'Connection timeout after 15 seconds'
							)
						),
					15000
				)
			),
		]);

		const result = await connectionTest;
		const duration = Date.now() - startTime;
		console.log(
			`   ✅ Basic connection successful (${duration}ms)`
		);

		console.log('   🔄 Testing table access...');
		try {
			// Check if tables exist
			const userCount = await prisma.user.count();
			console.log(
				`   ✅ User table accessible (${userCount} users)`
			);

			const postCount = await prisma.post.count();
			console.log(
				`   ✅ Post table accessible (${postCount} posts)`
			);

			const goalCount = await prisma.goal.count();
			console.log(
				`   ✅ Goal table accessible (${goalCount} goals)`
			);
		} catch (tableError) {
			console.log(
				'   ⚠️  Tables not accessible - may need migration'
			);
			console.log(`   Error: ${tableError.message}`);

			if (tableError.message.includes('does not exist')) {
				console.log(
					'   💡 Run: npx prisma db push OR npx prisma migrate deploy'
				);
				return false;
			}
		}

		await prisma.$disconnect();
		return true;
	} catch (error) {
		console.log(
			`   ❌ Database connection failed: ${error.message}`
		);

		if (error.message.includes('timeout')) {
			console.log(
				'   💡 Try: Check if database server is accessible'
			);
		} else if (error.message.includes('authentication')) {
			console.log('   💡 Try: Verify database credentials');
		} else if (error.message.includes('connect')) {
			console.log(
				'   💡 Try: Check database URL format and SSL settings'
			);
		}

		return false;
	}
}

// Vercel-specific checks
console.log('\n🚀 Vercel Configuration:');

// Check if likely running on Vercel
const isVercel =
	process.env.VERCEL === '1' || process.env.VERCEL_ENV;
if (isVercel) {
	console.log('   ✅ Running on Vercel');
	console.log(
		`   Environment: ${process.env.VERCEL_ENV || 'unknown'}`
	);
	console.log(
		`   Region: ${process.env.VERCEL_REGION || 'unknown'}`
	);
} else {
	console.log(
		'   ⭕ Not running on Vercel (or VERCEL env var not set)'
	);
}

// Check function configuration
if (process.env.VERCEL_REGION) {
	console.log(
		`   Function region: ${process.env.VERCEL_REGION}`
	);
	if (process.env.VERCEL_REGION === 'iad1') {
		console.log(
			'   ✅ Using recommended region for US databases'
		);
	}
}

// Run the database test
console.log();
testDatabase()
	.then((dbSuccess) => {
		// Summary
		console.log('\n📊 Summary:');

		if (hasAllRequired && dbSuccess) {
			console.log(
				'   ✅ All checks passed! Your Vercel setup looks good.'
			);
		} else {
			console.log(
				'   ❌ Some issues found that need attention:'
			);

			if (!hasAllRequired) {
				console.log(
					'   - Missing required environment variables'
				);
			}
			if (!dbSuccess) {
				console.log('   - Database connection issues');
			}
		}

		if (warnings.length > 0) {
			console.log('\n⚠️  Warnings:');
			warnings.forEach((warning) =>
				console.log(`   - ${warning}`)
			);
		}

		console.log('\n🔧 Next Steps:');
		if (!hasAllRequired) {
			console.log(
				'   1. Set missing environment variables in Vercel dashboard'
			);
		}
		if (!dbSuccess) {
			console.log(
				'   2. Fix database configuration and connection'
			);
		}
		console.log(
			'   3. Test admin setup: Visit /api/db-test'
		);
		console.log('   4. Create admin user: Visit /setup');

		if (!hasAllRequired || !dbSuccess) {
			process.exit(1);
		}
	})
	.catch((error) => {
		console.error(
			'\n❌ Verification script failed:',
			error.message
		);
		process.exit(1);
	});
