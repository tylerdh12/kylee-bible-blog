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

		// Create default admin with environment variable or fallback
		const defaultPassword =
			process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
		const hashedPassword = await bcryptjs.hash(
			defaultPassword,
			12
		);

		await prisma.user.create({
			data: {
				email: 'kylee@blog.com',
				password: hashedPassword,
				name: 'Kylee',
				role: 'admin',
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
