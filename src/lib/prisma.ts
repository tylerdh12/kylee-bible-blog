import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

// Standard Prisma client configuration for PostgreSQL with connection pooling
// Optimized for serverless environments (Vercel) where connections can be closed between requests
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

// Handle connection errors gracefully and suppress repeated "connection closed" errors
let lastErrorTime = 0;
const ERROR_SUPPRESSION_WINDOW = 5000; // Suppress same error for 5 seconds

prisma.$on('error' as never, (e: any) => {
	const now = Date.now();
	// Only log connection errors if they're not being spammed
	if (now - lastErrorTime > ERROR_SUPPRESSION_WINDOW) {
		// Check if it's a connection closed error
		if (e?.message?.includes('Closed') || e?.kind === 'Closed') {
			// In serverless, connection closed errors are common and usually recoverable
			// Only log in development to avoid log spam
			if (process.env.NODE_ENV === 'development') {
				console.warn('[Prisma] Connection closed (this is normal in serverless environments)');
			}
		} else {
			// Log other errors
			if (process.env.NODE_ENV === 'development') {
				console.error('[Prisma] Connection error:', e);
			}
		}
		lastErrorTime = now;
	}
});

// Add connection health check and reconnect logic
if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
} else {
	// In production, ensure we disconnect gracefully on process termination
	if (typeof process !== 'undefined') {
		const gracefulShutdown = async () => {
			try {
				await prisma.$disconnect();
			} catch (error) {
				// Ignore disconnect errors during shutdown
			}
		};
		
		process.on('beforeExit', gracefulShutdown);
		process.on('SIGINT', async () => {
			await gracefulShutdown();
			process.exit(0);
		});
		process.on('SIGTERM', async () => {
			await gracefulShutdown();
			process.exit(0);
		});
	}
}
