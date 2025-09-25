import { PrismaClient } from '@prisma/client'
import { mockPrisma } from './mock-db'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use mock database in production (Vercel) until we set up a proper database
const isProduction = process.env.NODE_ENV === 'production'
const isVercel = process.env.VERCEL === '1'

export const prisma = (isProduction && isVercel) 
  ? mockPrisma as any 
  : globalForPrisma.prisma ??
    new PrismaClient({
      log: ['query'],
    })

if (!isProduction) globalForPrisma.prisma = prisma as PrismaClient