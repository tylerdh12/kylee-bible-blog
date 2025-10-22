#!/usr/bin/env node

/**
 * Admin Verification Script
 *
 * This script verifies that the admin user exists and can be authenticated.
 * It's used during deployment to ensure the database is properly set up.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Configuration
const config = {
	isProduction: process.env.NODE_ENV === 'production',
	verbose:
		process.env.VERBOSE === 'true' ||
		process.env.NODE_ENV === 'development',
};

// Utility functions
function log(message, type = 'info') {
	const timestamp = new Date().toISOString();
	const prefix =
		{
			info: 'ℹ️',
			success: '✅',
			warning: '⚠️',
			error: '❌',
			step: '🔄',
		}[type] || 'ℹ️';

	console.log(`${prefix} [${timestamp}] ${message}`);
}

// Verification functions
async function verifyDatabaseConnection() {
	try {
		await prisma.$queryRaw`SELECT 1`;
		log('Database connection successful', 'success');
		return true;
	} catch (error) {
		log(
			`Database connection failed: ${error.message}`,
			'error'
		);
		return false;
	}
}

async function verifyAdminUser() {
	try {
		const adminUser = await prisma.user.findFirst({
			where: {
				role: 'ADMIN',
				isActive: true,
			},
		});

		if (!adminUser) {
			log('No admin user found', 'warning');
			return false;
		}

		log(`Admin user found: ${adminUser.email}`, 'success');

		// Verify password with environment variable or fallback
		if (adminUser.password) {
			const defaultPassword =
				process.env.ADMIN_DEFAULT_PASSWORD;
			if (!defaultPassword) {
				log(
					'ADMIN_DEFAULT_PASSWORD environment variable is required!',
					'error'
				);
				log(
					'Please set ADMIN_DEFAULT_PASSWORD in your .env.local file',
					'error'
				);
				return false;
			}
			const isValidPassword = await bcrypt.compare(
				defaultPassword,
				adminUser.password
			);
			if (isValidPassword) {
				log(
					'Admin password verification successful',
					'success'
				);
				return true;
			} else {
				log(
					'Admin password verification failed',
					'warning'
				);
				return false;
			}
		} else {
			log('Admin user has no password set', 'warning');
			return false;
		}
	} catch (error) {
		log(
			`Admin verification failed: ${error.message}`,
			'error'
		);
		return false;
	}
}

async function verifyDatabaseTables() {
	try {
		// Check if all required tables exist
		const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

		const requiredTables = [
			'User',
			'Post',
			'Tag',
			'Comment',
			'Goal',
			'Donation',
			'PrayerRequest',
		];
		const existingTables = tables.map((t) => t.table_name);

		log(
			`Found ${
				existingTables.length
			} tables: ${existingTables.join(', ')}`,
			'info'
		);

		const missingTables = requiredTables.filter(
			(table) =>
				!existingTables.some(
					(existing) =>
						existing.toLowerCase() === table.toLowerCase()
				)
		);

		if (missingTables.length > 0) {
			log(
				`Missing tables: ${missingTables.join(', ')}`,
				'warning'
			);
			return false;
		}

		log('All required tables exist', 'success');
		return true;
	} catch (error) {
		log(
			`Table verification failed: ${error.message}`,
			'error'
		);
		return false;
	}
}

async function verifySampleData() {
	try {
		const counts = await Promise.all([
			prisma.user.count(),
			prisma.post.count(),
			prisma.goal.count(),
			prisma.donation.count(),
			prisma.prayerRequest.count(),
		]);

		const [
			userCount,
			postCount,
			goalCount,
			donationCount,
			prayerRequestCount,
		] = counts;

		log(
			`Data counts - Users: ${userCount}, Posts: ${postCount}, Goals: ${goalCount}, Donations: ${donationCount}, Prayer Requests: ${prayerRequestCount}`,
			'info'
		);

		if (userCount === 0) {
			log('No users found in database', 'warning');
			return false;
		}

		if (postCount === 0 && config.isProduction) {
			log(
				'No posts found in production database',
				'warning'
			);
			return false;
		}

		log('Sample data verification passed', 'success');
		return true;
	} catch (error) {
		log(
			`Sample data verification failed: ${error.message}`,
			'error'
		);
		return false;
	}
}

// Main verification function
async function main() {
	try {
		log('Starting admin verification...', 'info');
		log(
			`Environment: ${
				config.isProduction ? 'Production' : 'Development'
			}`,
			'info'
		);

		const results = await Promise.all([
			verifyDatabaseConnection(),
			verifyDatabaseTables(),
			verifyAdminUser(),
			verifySampleData(),
		]);

		const [dbConnection, tables, adminUser, sampleData] =
			results;

		if (dbConnection && tables && adminUser && sampleData) {
			log('All verifications passed! 🎉', 'success');
			log('Admin user is ready for use', 'success');
			process.exit(0);
		} else {
			log('Some verifications failed', 'warning');
			log('Database may need additional setup', 'warning');
			process.exit(1);
		}
	} catch (error) {
		log(`Verification failed: ${error.message}`, 'error');
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Handle script execution
if (require.main === module) {
	main();
}

module.exports = {
	main,
	verifyDatabaseConnection,
	verifyAdminUser,
	verifyDatabaseTables,
	verifySampleData,
};
