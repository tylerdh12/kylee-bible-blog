#!/usr/bin/env node

/**
 * Site Content Migration Script
 *
 * This script ensures the SiteContent table exists in the database.
 * It can be run independently or as part of the setup process.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateSiteContent() {
	try {
		console.log('🔄 Checking SiteContent table...');

		// Try to query the table to see if it exists
		try {
			await prisma.siteContent.findFirst();
			console.log('✅ SiteContent table already exists');
		} catch (error) {
			if (error.code === 'P2021' || error.message.includes('does not exist')) {
				console.log('⚠️  SiteContent table does not exist');
				console.log('📝 Please run: npx prisma db push');
				console.log('   Or: npx prisma migrate dev --name add_site_content');
				process.exit(1);
			} else {
				throw error;
			}
		}

		// Check if we have any content
		const count = await prisma.siteContent.count();
		console.log(`📊 Found ${count} site content items in database`);

		if (count === 0) {
			console.log('💡 Run the seed script to populate default content:');
			console.log('   node scripts/seed-database.js');
		}

		console.log('✅ SiteContent migration check completed');
	} catch (error) {
		console.error('❌ Error checking SiteContent table:', error.message);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

if (require.main === module) {
	migrateSiteContent();
}

module.exports = { migrateSiteContent };
