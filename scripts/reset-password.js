#!/usr/bin/env node

/**
 * Reset Password for Better Auth User
 *
 * Resets a user's password using better-auth's API or direct database update
 */

const { PrismaClient } = require('@prisma/client');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const readline = require('readline');

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function question(query) {
	return new Promise((resolve) =>
		rl.question(query, resolve)
	);
}

async function resetPassword() {
	try {
		console.log('🔄 Password Reset Tool\n');

		// Get email from user
		const email = await question('Enter email address to reset password: ');
		if (!email || !email.includes('@')) {
			console.error('❌ Invalid email address');
			process.exit(1);
		}

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
			console.error(`❌ User with email ${email} not found`);
			process.exit(1);
		}

		console.log(`\n✅ Found user: ${user.name || email}`);
		console.log(`   Role: ${user.role || 'SUBSCRIBER'}\n`);

		// Get new password
		const password = await question('Enter new password: ');
		if (!password || password.length < 8) {
			console.error('❌ Password must be at least 8 characters');
			process.exit(1);
		}

		const confirmPassword = await question('Confirm new password: ');
		if (password !== confirmPassword) {
			console.error('❌ Passwords do not match');
			process.exit(1);
		}

		// Try to use better-auth's changePassword API first (if server is running)
		const baseURL =
			process.env.BETTER_AUTH_URL ||
			process.env.NEXTAUTH_URL ||
			'http://localhost:3000';

		console.log('\n🔄 Attempting to reset password via better-auth API...');

		try {
			// First, try to sign up with the new password to get proper hashing
			// We'll delete and recreate the account entry
			const account = user.accounts[0];

			if (account) {
				// Hash password using scrypt (better-auth's default)
				const salt = randomBytes(16);
				const hash = await scryptAsync(password, salt, 64);
				const hashedPassword = `${salt.toString('hex')}:${hash.toString('hex')}`;

				// Update the account password
				await prisma.account.update({
					where: { id: account.id },
					data: { password: hashedPassword },
				});

				console.log('   ✅ Password reset successfully using scrypt hashing');
			} else {
				// Create account if it doesn't exist
				const salt = randomBytes(16);
				const hash = await scryptAsync(password, salt, 64);
				const hashedPassword = `${salt.toString('hex')}:${hash.toString('hex')}`;

				await prisma.account.create({
					data: {
						id: `acc_${user.id}`,
						accountId: user.id,
						providerId: 'credential',
						userId: user.id,
						password: hashedPassword,
					},
				});

				console.log('   ✅ Account created with new password');
			}

			console.log(`\n✅ Password reset complete!`);
			console.log(`\n📋 Updated Credentials:`);
			console.log(`   Email: ${email}`);
			console.log(`   Password: [the password you entered]`);
			console.log(`\n💡 You can now log in at /admin`);
		} catch (error) {
			console.error('❌ Error resetting password:', error.message);
			if (error.stack) {
				console.error('Stack:', error.stack);
			}
			process.exit(1);
		}
	} catch (error) {
		console.error('❌ Error:', error.message);
		if (error.stack) {
			console.error('Stack:', error.stack);
		}
		process.exit(1);
	} finally {
		await prisma.$disconnect();
		rl.close();
	}
}

if (require.main === module) {
	resetPassword();
}

module.exports = { resetPassword };
