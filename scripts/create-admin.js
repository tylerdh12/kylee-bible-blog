import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

async function createDefaultAdmin() {
	try {
		// Check if admin already exists
		const existingAdmin = await prisma.user.findFirst();
		if (existingAdmin) {
			console.log('Admin user already exists!');
			return;
		}

		// Create default admin with environment variable (required for security)
		const defaultPassword =
			process.env.ADMIN_DEFAULT_PASSWORD;
		if (!defaultPassword) {
			console.error(
				'❌ ADMIN_DEFAULT_PASSWORD environment variable is required!'
			);
			console.error(
				'Please set ADMIN_DEFAULT_PASSWORD in your .env.local file'
			);
			process.exit(1);
		}
		// Use better-auth's password hashing function
		const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
		const authSecret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || '';
		
		const tempAuth = betterAuth({
			database: prismaAdapter(prisma, { provider: 'postgresql' }),
			secret: authSecret,
			baseURL: baseURL,
			emailAndPassword: {
				enabled: true,
				password: {
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

		const ctx = await tempAuth.$context;
		const hashedPassword = await ctx.password.hash(defaultPassword);

		// Create user
		const user = await prisma.user.create({
			data: {
				email: 'kylee@blog.com',
				name: 'Kylee',
				role: 'ADMIN',
			},
		});

		// Create account with password (better-auth stores passwords in Account model)
		await prisma.account.create({
			data: {
				id: `acc_${user.id}`,
				accountId: user.id,
				providerId: 'credential',
				userId: user.id,
				password: hashedPassword,
			},
		});

		console.log(
			'✅ Default admin user created successfully!'
		);
		console.log('📧 Email: kylee@blog.com');
		console.log(`🔐 Password: ${defaultPassword}`);
		console.log(
			'⚠️  Please change this password after first login!'
		);
	} catch (error) {
		console.error('Error creating admin user:', error);
	} finally {
		await prisma.$disconnect();
	}
}

createDefaultAdmin();
