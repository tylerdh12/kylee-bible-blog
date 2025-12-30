import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

// Standard Prisma client configuration for PostgreSQL with connection pooling
export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log:
			process.env.NODE_ENV === 'development'
				? ['error', 'warn'] // Removed 'query' to reduce log overhead
				: ['error'],
		// Optimize connection pooling for better performance
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
	});

if (process.env.NODE_ENV !== 'production')
	globalForPrisma.prisma = prisma;
