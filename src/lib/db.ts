import { prisma as realPrisma } from './prisma';
import { mockPrisma } from './mock-db';

// Use real database if DATABASE_URL is available, otherwise fallback to mock
const hasRealDatabase =
	!!process.env.DATABASE_URL &&
	process.env.DATABASE_URL !== 'file:./dev.db';

export const prisma = hasRealDatabase
	? realPrisma
	: (mockPrisma as any);
