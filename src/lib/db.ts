import { prisma as realPrisma } from './prisma';

// Always use real database - no mock fallback
export const prisma = realPrisma;
