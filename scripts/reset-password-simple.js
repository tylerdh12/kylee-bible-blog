#!/usr/bin/env node

/**
 * Reset Password for Better Auth User (Non-Interactive)
 *
 * Usage: node scripts/reset-password-simple.js <email> <new-password>
 * Example: node scripts/reset-password-simple.js tyler@tylerharper.dev MyNewPassword123
 *
 * This script uses better-auth's password hashing utilities directly
 * to ensure password format matches exactly.
 */

const { PrismaClient } = require('@prisma/client');
const { betterAuth } = require('better-auth');
const { prismaAdapter } = require('better-auth/adapters/prisma');

const prisma = new PrismaClient();

async function resetPassword(email, password) {
	try {
		if (!email || !email.includes('@')) {
			throw new Error('Invalid email address');
		}

		if (!password || password.length < 8) {
			throw new Error('Password must be at least 8 characters');
		}

		console.log(`🔄 Resetting password for ${email}...\n`);

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { email },
			include: {
				accounts: {
					where: { providerId: 'credential' },
				},
			},
		});

		if (!user) {
			throw new Error(`User with email ${email} not found`);
		}

		console.log(`✅ Found user: ${user.name || email}`);
		console.log(`   Role: ${user.role || 'SUBSCRIBER'}\n`);

		console.log('🔄 Hashing password using better-auth utilities...\n');

		try {
			// Create a temporary auth instance to access password utilities
			// This ensures we use the exact same hashing as better-auth
			const baseURL =
				process.env.BETTER_AUTH_URL ||
				process.env.NEXTAUTH_URL ||
				'http://localhost:3000';
			
			const authSecret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET;
			if (!authSecret) {
				throw new Error('BETTER_AUTH_SECRET or JWT_SECRET environment variable is required');
			}

			// Create better-auth instance with the same configuration as the app
			// This ensures we use the exact same password hashing function
			const tempAuth = betterAuth({
				database: prismaAdapter(prisma, { provider: 'postgresql' }),
				secret: authSecret,
				baseURL: baseURL,
				emailAndPassword: {
					enabled: true,
					password: {
						// Use bcrypt with 12 rounds to match app configuration
						hash: async (password) => {
							const bcryptjs = require('bcryptjs');
							return await bcryptjs.hash(password, 12);
						},
						verify: async ({ hash, password }) => {
							const bcryptjs = require('bcryptjs');
							return await bcryptjs.compare(password, hash);
						},
					},
				},
			});

			// Get better-auth's password context and use its hash function
			const ctx = await tempAuth.$context;
			const hashedPassword = await ctx.password.hash(password);

			// Update or create account for the actual user
			const account = user.accounts[0];

			if (account) {
				await prisma.account.update({
					where: { id: account.id },
					data: { password: hashedPassword },
				});
				console.log('✅ Password updated successfully using better-auth password hashing');
			} else {
				await prisma.account.create({
					data: {
						id: `acc_${user.id}`,
						accountId: user.id,
						providerId: 'credential',
						userId: user.id,
						password: hashedPassword,
					},
				});
				console.log('✅ Account created with better-auth password hashing');
			}
		} catch (error) {
			console.error('❌ Error resetting password:', error.message);
			if (error.stack) {
				console.error('Stack:', error.stack);
			}
			throw error;
		}

		console.log(`\n✅ Password reset complete!`);
		console.log(`\n📋 Updated Credentials:`);
		console.log(`   Email: ${email}`);
		console.log(`   Password: ${password}`);
		console.log(`\n💡 You can now log in at /admin`);
	} catch (error) {
		console.error('❌ Error:', error.message);
		if (error.stack) {
			console.error('Stack:', error.stack);
		}
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Get arguments from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
	console.error('Usage: node scripts/reset-password-simple.js <email> <new-password>');
	console.error('Example: node scripts/reset-password-simple.js tyler@tylerharper.dev MyNewPassword123');
	process.exit(1);
}

resetPassword(email, password);
