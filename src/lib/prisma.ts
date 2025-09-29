import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
    // Optimize for serverless environments
    transactionOptions: {
      timeout: 5000, // 5 seconds
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Ensure graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})