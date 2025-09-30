#!/usr/bin/env node

/**
 * Production environment checker
 * Validates environment variables for production deployment
 */

console.log(
	'🔍 Checking production environment configuration...\n'
);

// Check Node.js version
console.log('📦 Node.js version:', process.version);
console.log(
	'🌍 Environment:',
	process.env.NODE_ENV || 'development'
);
console.log();

// Required environment variables
const requiredVars = [
	'DATABASE_URL',
	'JWT_SECRET',
	'NEXTAUTH_SECRET',
	'NEXTAUTH_URL',
];

// Optional but recommended
const optionalVars = [
	'ALLOW_ADMIN_SETUP',
	'ADMIN_SETUP_KEY',
	'NEXT_PUBLIC_BASE_URL',
];

console.log('✅ Required Environment Variables:');
let missingRequired = [];

requiredVars.forEach((varName) => {
	const value = process.env[varName];
	if (value) {
		// Mask sensitive values
		if (
			varName.includes('SECRET') ||
			varName.includes('URL')
		) {
			const masked =
				value.length > 10
					? value.substring(0, 6) +
					  '***' +
					  value.substring(value.length - 4)
					: '***';
			console.log(
				`   ${varName}: ${masked} (${value.length} chars)`
			);
		} else {
			console.log(`   ${varName}: ${value}`);
		}
	} else {
		console.log(`   ${varName}: ❌ NOT SET`);
		missingRequired.push(varName);
	}
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach((varName) => {
	const value = process.env[varName];
	if (value) {
		console.log(`   ${varName}: ${value}`);
	} else {
		console.log(`   ${varName}: (not set)`);
	}
});

// Database URL validation
console.log('\n🗄️  Database Configuration:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
	try {
		const url = new URL(dbUrl);
		console.log(`   Protocol: ${url.protocol}`);
		console.log(`   Host: ${url.hostname}`);
		console.log(`   Port: ${url.port || 'default'}`);
		console.log(
			`   Database: ${url.pathname.substring(1)}`
		);
		console.log(`   Username: ${url.username}`);
		console.log(
			`   Password: ${'*'.repeat(url.password.length)} (${
				url.password.length
			} chars)`
		);

		if (
			url.protocol !== 'postgresql:' &&
			url.protocol !== 'postgres:'
		) {
			console.log(
				'   ⚠️  Warning: Protocol should be postgresql: or postgres:'
			);
		}
	} catch (error) {
		console.log('   ❌ Invalid database URL format');
		console.log('   Error:', error.message);
	}
} else {
	console.log('   ❌ No database URL configured');
}

// Security recommendations
console.log('\n🔒 Security Check:');
const jwtSecret = process.env.JWT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (jwtSecret && jwtSecret.length < 32) {
	console.log(
		'   ⚠️  JWT_SECRET should be at least 32 characters long'
	);
} else if (jwtSecret) {
	console.log('   ✅ JWT_SECRET length is sufficient');
}

if (nextAuthSecret && nextAuthSecret.length < 32) {
	console.log(
		'   ⚠️  NEXTAUTH_SECRET should be at least 32 characters long'
	);
} else if (nextAuthSecret) {
	console.log('   ✅ NEXTAUTH_SECRET length is sufficient');
}

// Summary
console.log('\n📊 Summary:');
if (missingRequired.length === 0) {
	console.log(
		'   ✅ All required environment variables are set'
	);
} else {
	console.log(
		`   ❌ Missing ${
			missingRequired.length
		} required variables: ${missingRequired.join(', ')}`
	);
}

if (process.env.ALLOW_ADMIN_SETUP === 'true') {
	console.log(
		'   ⚠️  Admin setup is enabled in production'
	);
	console.log(
		'   💡 Consider disabling after initial setup for security'
	);
}

console.log('\n🚀 Next Steps:');
console.log('   1. Fix any missing environment variables');
console.log(
	'   2. Test database connection: Visit /api/db-test'
);
console.log('   3. Test admin setup: Visit /setup');
console.log(
	'   4. After setup, consider disabling ALLOW_ADMIN_SETUP'
);

if (missingRequired.length > 0) {
	process.exit(1);
}
