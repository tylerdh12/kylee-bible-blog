import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log:
			process.env.NODE_ENV === 'development'
				? ['query', 'error', 'warn']
				: ['error'],
		// Use standard configuration for Neon/PostgreSQL
		transactionOptions: {
			timeout: 10000, // 10 seconds for Vercel
			maxWait: 5000, // 5 seconds max wait
			isolationLevel: 'ReadCommitted', // Better for serverless
		},
	});

if (process.env.NODE_ENV !== 'production')
	globalForPrisma.prisma = prisma;

// Ensure graceful shutdown
process.on('beforeExit', async () => {
	await prisma.$disconnect();
});
