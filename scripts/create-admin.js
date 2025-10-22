import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

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
		const hashedPassword = await bcryptjs.hash(
			defaultPassword,
			12
		);

		await prisma.user.create({
			data: {
				email: 'kylee@blog.com',
				password: hashedPassword,
				name: 'Kylee',
				role: 'ADMIN',
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
