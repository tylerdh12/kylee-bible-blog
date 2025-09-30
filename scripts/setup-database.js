#!/usr/bin/env node

/**
 * Database Setup Script
 *
 * This script handles database setup, migrations, and seeding for deployment.
 * It can be run in different environments (development, production) and
 * handles the complete database initialization process.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
	// Environment detection
	isProduction: process.env.NODE_ENV === 'production',
	isDevelopment: process.env.NODE_ENV === 'development',

	// Database URLs
	databaseUrl: process.env.DATABASE_URL,

	// Script paths
	prismaPath: path.join(
		__dirname,
		'..',
		'node_modules',
		'.bin',
		'prisma'
	),

	// Logging
	verbose:
		process.env.VERBOSE === 'true' ||
		process.env.NODE_ENV === 'development',

	// Database provider detection
	isPostgreSQL: (
		process.env.DATABASE_URL ||
		''
	).startsWith('postgresql://'),
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

function logStep(step, total, message) {
	log(`[${step}/${total}] ${message}`, 'step');
}

function runCommand(command, description) {
	try {
		log(`Running: ${command}`, 'step');
		const output = execSync(command, {
			encoding: 'utf8',
			stdio: config.verbose ? 'inherit' : 'pipe',
		});

		if (!config.verbose && output) {
			log(`Output: ${output.trim()}`, 'info');
		}

		return { success: true, output };
	} catch (error) {
		log(`Failed: ${description}`, 'error');
		log(`Command: ${command}`, 'error');
		log(`Error: ${error.message}`, 'error');
		throw error;
	}
}

function checkPrerequisites() {
	logStep(1, 6, 'Checking prerequisites...');

	// Check if Prisma is installed
	if (!fs.existsSync(config.prismaPath)) {
		throw new Error(
			'Prisma CLI not found. Please run npm install first.'
		);
	}

	// Check database URL
	if (!config.databaseUrl) {
		throw new Error(
			'Database URL not found. Please set DATABASE_URL environment variable.'
		);
	}

	// Check database provider
	if (config.isPostgreSQL) {
		log('Using PostgreSQL database', 'info');
	} else {
		log(
			'Unknown database provider, assuming PostgreSQL',
			'warning'
		);
	}

	log('Prerequisites check passed', 'success');
}

function generatePrismaClient() {
	logStep(2, 6, 'Generating Prisma client...');

	try {
		runCommand(
			`${config.prismaPath} generate`,
			'Generate Prisma client'
		);
		log('Prisma client generated successfully', 'success');
	} catch (error) {
		log('Failed to generate Prisma client', 'error');
		throw error;
	}
}

function runMigrations() {
	logStep(3, 6, 'Running database migrations...');

	try {
		if (config.isProduction) {
			// In production with PostgreSQL, use prisma migrate deploy for safety
			runCommand(
				`${config.prismaPath} migrate deploy`,
				'Deploy migrations'
			);
		} else {
			// In development with PostgreSQL, use prisma db push for faster iteration
			runCommand(
				`${config.prismaPath} db push`,
				'Push schema changes'
			);
		}

		log(
			'Database migrations completed successfully',
			'success'
		);
	} catch (error) {
		log('Failed to run migrations', 'error');
		throw error;
	}
}

function seedDatabase() {
	logStep(4, 6, 'Seeding database...');

	try {
		// Check if seed script exists
		const seedScript = path.join(
			__dirname,
			'seed-database.js'
		);

		if (fs.existsSync(seedScript)) {
			runCommand(`node ${seedScript}`, 'Seed database');
			log('Database seeded successfully', 'success');
		} else {
			log(
				'No seed script found, skipping seeding',
				'warning'
			);
		}
	} catch (error) {
		log('Failed to seed database', 'error');
		// Don't throw here - seeding failures shouldn't break deployment
		log('Continuing without seed data...', 'warning');
	}
}

async function verifyDatabase() {
	logStep(5, 6, 'Verifying database setup...');

	try {
		// Run a simple query to verify the database is working
		const verifyScript = `
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      async function verify() {
        try {
          // Test basic connectivity
          await prisma.$queryRaw\`SELECT 1\`;
          
			// Check if tables exist (PostgreSQL)
			const tables = await prisma.$queryRaw\`
				SELECT table_name 
				FROM information_schema.tables 
				WHERE table_schema = 'public'
			\`;
          
          console.log('Database verification successful');
          console.log('Tables found:', tables.length);
          
          await prisma.$disconnect();
        } catch (error) {
          console.error('Database verification failed:', error.message);
          process.exit(1);
        }
      }
      
      verify();
    `;

		const tempFile = path.join(__dirname, 'temp-verify.js');
		fs.writeFileSync(tempFile, verifyScript);

		runCommand(`node ${tempFile}`, 'Verify database');

		// Clean up temp file
		fs.unlinkSync(tempFile);

		log('Database verification completed', 'success');
	} catch (error) {
		log('Database verification failed', 'error');
		throw error;
	}
}

function createAdminUser() {
	logStep(6, 6, 'Creating admin user...');

	try {
		// Check if admin creation script exists
		const adminScript = path.join(
			__dirname,
			'create-admin.js'
		);

		if (fs.existsSync(adminScript)) {
			runCommand(
				`node ${adminScript}`,
				'Create admin user'
			);
			log('Admin user setup completed', 'success');
		} else {
			log(
				'No admin creation script found, skipping admin setup',
				'warning'
			);
		}
	} catch (error) {
		log('Failed to create admin user', 'error');
		// Don't throw here - admin creation failures shouldn't break deployment
		log('Continuing without admin user...', 'warning');
	}
}

// Main execution
async function main() {
	try {
		log('Starting database setup...', 'info');
		log(
			`Environment: ${
				config.isProduction ? 'Production' : 'Development'
			}`,
			'info'
		);

		checkPrerequisites();
		generatePrismaClient();
		runMigrations();
		seedDatabase();
		await verifyDatabase();
		createAdminUser();

		log(
			'Database setup completed successfully! 🎉',
			'success'
		);

		if (config.isProduction) {
			log(
				'Production database is ready for use',
				'success'
			);
		} else {
			log(
				'Development database is ready for use',
				'success'
			);
		}
	} catch (error) {
		log('Database setup failed!', 'error');
		log(`Error: ${error.message}`, 'error');
		process.exit(1);
	}
}

// Handle script execution
if (require.main === module) {
	main();
}

module.exports = {
	main,
	config,
	log,
	runCommand,
};
