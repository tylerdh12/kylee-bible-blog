import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { passkey } from '@better-auth/passkey';
import bcryptjs from 'bcryptjs';
import { prisma } from './db';

const authSecret =
	process.env.BETTER_AUTH_SECRET ||
	process.env.JWT_SECRET ||
	'';

if (!authSecret && process.env.NODE_ENV === 'development') {
	console.warn(
		'WARNING: BETTER_AUTH_SECRET is not set. Authentication may not work properly.'
	);
}

// Production domains - the primary domain and any alternatives
const PRODUCTION_DOMAINS = [
	'https://www.kyspreadslove.org',
	'https://kyspreadslove.org',
	'https://kylee-bible-blog.vercel.app',
];

// Get the origin for passkey configuration
// In production, default to the primary production domain
const baseURL =
	process.env.BETTER_AUTH_URL ||
	(process.env.NODE_ENV === 'production'
		? PRODUCTION_DOMAINS[0]
		: 'http://localhost:3000');

let origin: string;
let rpID: string;
let trustedOrigins: string[] = [];

try {
	const url = new URL(baseURL);
	origin = url.origin;
	// For production, use the hostname (without port)
	// For development, use localhost
	rpID =
		process.env.NODE_ENV === 'production'
			? url.hostname.replace(/^www\./, '') // Use base domain for rpID
			: 'localhost';

	// In production, trust all production domains
	if (process.env.NODE_ENV === 'production') {
		trustedOrigins = [...PRODUCTION_DOMAINS];
	} else {
		trustedOrigins = [origin, 'http://localhost:3000'];
	}
} catch {
	// Fallback if URL parsing fails
	origin =
		process.env.NODE_ENV === 'production'
			? 'https://www.kyspreadslove.org'
			: 'http://localhost:3000';
	rpID =
		process.env.NODE_ENV === 'production'
			? 'kyspreadslove.org'
			: 'localhost';

	trustedOrigins =
		process.env.NODE_ENV === 'production'
			? PRODUCTION_DOMAINS
			: [origin];
}

if (process.env.NODE_ENV === 'development') {
	console.log('[Better Auth] Configuration:', {
		rpID,
		origin,
		baseURL,
		trustedOrigins,
	});
}

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	baseURL,
	secret: authSecret,
	trustedOrigins,
	plugins: [
		passkey({
			rpName: "Kylee's Blog",
			rpID,
			origin: trustedOrigins, // Allow passkeys from any trusted origin
		}),
	],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Can enable later
		password: {
			// Use bcrypt for password hashing to match existing password hashes
			// This ensures compatibility with passwords hashed by admin scripts
			hash: async (password: string) => {
				return await bcryptjs.hash(password, 12);
			},
			verify: async ({
				hash,
				password,
			}: {
				hash: string;
				password: string;
			}) => {
				if (!hash || !password) {
					if (process.env.NODE_ENV === 'development') {
						console.log(
							'[Better Auth] Password verification: missing hash or password'
						);
					}
					return false;
				}

				try {
					// First try bcrypt (for passwords hashed with our scripts)
					const isValid = await bcryptjs.compare(
						password,
						hash
					);

					if (isValid) {
						if (process.env.NODE_ENV === 'development') {
							console.log(
								'[Better Auth] Password verified successfully with bcrypt'
							);
						}
						return true;
					}

					// If bcrypt fails, the password might be in scrypt format (better-auth default)
					// Better-auth uses scrypt with specific parameters: N=16384, r=8, p=1, dkLen=64
					// Format: salt:hash (both hex encoded)
					if (hash.includes(':')) {
						try {
							const { scryptSync } = await import('crypto');

							const [saltHex, hashHex] = hash.split(':');
							if (!saltHex || !hashHex) {
								if (
									process.env.NODE_ENV === 'development'
								) {
									console.log(
										'[Better Auth] Invalid scrypt hash format'
									);
								}
								return false;
							}

							const salt = Buffer.from(saltHex, 'hex');

							// Better-auth uses scrypt with default Node.js parameters
							// Default Node.js scrypt: N=16384, r=8, p=1, dkLen=64
							// @ts-ignore - scryptSync accepts options as 4th parameter
							let derivedKey = scryptSync(
								password,
								salt,
								64,
								{
									N: 16384,
									r: 8,
									p: 1,
								}
							);

							let isValidScrypt =
								derivedKey.toString('hex') === hashHex;

							// If that doesn't work, try without explicit parameters (uses Node.js defaults)
							if (!isValidScrypt) {
								if (
									process.env.NODE_ENV === 'development'
								) {
									console.log(
										'[Better Auth] Trying scrypt without explicit parameters'
									);
								}
								derivedKey = scryptSync(password, salt, 64);
								isValidScrypt =
									derivedKey.toString('hex') === hashHex;
							}

							// Log more details for debugging
							if (
								process.env.NODE_ENV === 'development' &&
								!isValidScrypt
							) {
								console.log(
									'[Better Auth] Scrypt verification details:'
								);
								console.log(
									'  Salt length (hex):',
									saltHex.length
								);
								console.log(
									'  Hash length (hex):',
									hashHex.length
								);
								console.log(
									'  Derived key length (hex):',
									derivedKey.toString('hex').length
								);
								console.log(
									'  Salt (first 20 chars):',
									saltHex.substring(0, 20)
								);
								console.log(
									'  Stored hash (first 20 chars):',
									hashHex.substring(0, 20)
								);
								console.log(
									'  Derived hash (first 20 chars):',
									derivedKey
										.toString('hex')
										.substring(0, 20)
								);
							}
							if (process.env.NODE_ENV === 'development') {
								console.log(
									'[Better Auth] Password verification:',
									isValidScrypt
										? 'successful with scrypt'
										: 'failed with both bcrypt and scrypt'
								);
								if (!isValidScrypt) {
									console.log(
										'[Better Auth] Hash format check - starts with $2b$ (bcrypt):',
										hash.startsWith('$2b$')
									);
									console.log(
										'[Better Auth] Hash format check - contains : (scrypt):',
										hash.includes(':')
									);
								}
							}
							return isValidScrypt;
						} catch (scryptError) {
							if (process.env.NODE_ENV === 'development') {
								console.error(
									'[Better Auth] Scrypt verification error:',
									scryptError
								);
							}
						}
					}

					if (process.env.NODE_ENV === 'development') {
						console.log(
							'[Better Auth] Password verification failed - hash format:',
							hash?.substring(0, 30) + '...'
						);
					}
					return false;
				} catch (error) {
					if (process.env.NODE_ENV === 'development') {
						console.error(
							'[Better Auth] Password verification error:',
							error
						);
					}
					return false;
				}
			},
		},
		sendResetPassword: async (
			{ user, url, token },
			request
		) => {
			// Import email utilities
			const { sendEmail, generatePasswordResetEmail } =
				await import('./utils/email');

			// Generate email content
			const { html, text } = generatePasswordResetEmail(
				url,
				user.name || undefined
			);

			// Send email
			await sendEmail({
				to: user.email,
				subject: 'Reset Your Password',
				html,
				text,
			});
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'SUBSCRIBER',
				input: false, // Admin sets this, not user during signup
			},
			isActive: {
				type: 'boolean',
				required: false,
				defaultValue: true,
				input: false,
			},
			avatar: {
				type: 'string',
				required: false,
				input: true,
			},
			bio: {
				type: 'string',
				required: false,
				input: true,
			},
			website: {
				type: 'string',
				required: false,
				input: true,
			},
		},
	},
	advanced: {
		useSecureCookies: process.env.NODE_ENV === 'production',
	},
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
