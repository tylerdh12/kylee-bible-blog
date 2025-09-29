import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

// Ensure we're using standard PostgreSQL connection (not Accelerate)
export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
		// Explicitly specify datasource to override any cached configurations
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
		// Disable any Accelerate-related features
		__internal: {
			engine: {
				endpoint: undefined,
			},
		},
	});

if (process.env.NODE_ENV !== 'production')
	globalForPrisma.prisma = prisma;
