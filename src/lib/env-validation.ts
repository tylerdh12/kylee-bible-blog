/**
 * Environment variable validation for production deployment
 */

export function validateProductionEnv() {
	// Skip validation during build if SKIP_ENV_VALIDATION is set
	if (process.env.SKIP_ENV_VALIDATION === 'true') {
		console.log(
			'Skipping environment validation during build'
		);
		return true;
	}

	const requiredEnvVars = [
		'JWT_SECRET',
		'NEXTAUTH_SECRET',
		'NEXTAUTH_URL',
	];

	// Database URL - prefer DATABASE_URL for Neon
	const hasDatabaseUrl = process.env.DATABASE_URL;
	if (!hasDatabaseUrl) {
		requiredEnvVars.push('DATABASE_URL');
	}

	const missing = requiredEnvVars.filter(
		(envVar) => !process.env[envVar]
	);

	if (
		missing.length > 0 &&
		process.env.NODE_ENV === 'production'
	) {
		console.warn(
			'Missing required environment variables:',
			missing
		);
		// Don't throw during build, just warn
		return false;
	}

	// Validate JWT_SECRET length for security
	if (
		process.env.JWT_SECRET &&
		process.env.JWT_SECRET.length < 32
	) {
		console.warn(
			'JWT_SECRET should be at least 32 characters long for security'
		);
	}

	// Validate NEXTAUTH_SECRET length
	if (
		process.env.NEXTAUTH_SECRET &&
		process.env.NEXTAUTH_SECRET.length < 32
	) {
		console.warn(
			'NEXTAUTH_SECRET should be at least 32 characters long for security'
		);
	}

	// Validate DATABASE_URL format for production
	const databaseUrl = process.env.DATABASE_URL;
	if (
		process.env.NODE_ENV === 'production' &&
		databaseUrl
	) {
		if (!databaseUrl.startsWith('postgresql://')) {
			console.warn(
				'Database URL should use PostgreSQL for production deployment.'
			);
		}
	}

	return true;
}

// Export environment configuration
export const env = {
	NODE_ENV: process.env.NODE_ENV || 'development',
	DATABASE_URL: process.env.DATABASE_URL,
	JWT_SECRET: process.env.JWT_SECRET,
	NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
	NEXTAUTH_URL: process.env.NEXTAUTH_URL,
	NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
	isProduction: process.env.NODE_ENV === 'production',
	isDevelopment: process.env.NODE_ENV === 'development',
} as const;
