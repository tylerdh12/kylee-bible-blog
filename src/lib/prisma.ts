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
		datasourceUrl:
			process.env.POSTGRES_PRISMA_URL ||
			process.env.DATABASE_URL,
		// Optimize for serverless environments (Vercel)
		datasources: {
			db: {
				url:
					process.env.POSTGRES_PRISMA_URL ||
					process.env.DATABASE_URL,
			},
		},
		transactionOptions: {
			timeout: 10000, // 10 seconds for Vercel
			maxWait: 5000, // 5 seconds max wait
			isolationLevel: 'ReadCommitted', // Better for serverless
		},
		// Connection pooling for Vercel
		__internal: {
			engine: {
				maxMemory: 512, // Limit memory usage
			},
		},
	});

if (process.env.NODE_ENV !== 'production')
	globalForPrisma.prisma = prisma;

// Ensure graceful shutdown
process.on('beforeExit', async () => {
	await prisma.$disconnect();
});
