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
		'BETTER_AUTH_SECRET',
		'BETTER_AUTH_URL',
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

	// Validate BETTER_AUTH_SECRET length for security
	if (
		process.env.BETTER_AUTH_SECRET &&
		process.env.BETTER_AUTH_SECRET.length < 32
	) {
		console.warn(
			'BETTER_AUTH_SECRET should be at least 32 characters long for security'
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
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
	NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
	isProduction: process.env.NODE_ENV === 'production',
	isDevelopment: process.env.NODE_ENV === 'development',
} as const;
