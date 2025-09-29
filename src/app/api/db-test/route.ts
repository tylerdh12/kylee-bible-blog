import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		console.log('🔍 Testing database connection...');

		// Check environment variables
		const dbUrl =
			process.env.POSTGRES_PRISMA_URL ||
			process.env.DATABASE_URL;
		const hasDbUrl = !!dbUrl;
		const dbUrlMasked = dbUrl
			? dbUrl.replace(/:[^:]*@/, ':***@')
			: 'Not set';

		console.log('Environment check:', {
			NODE_ENV: process.env.NODE_ENV,
			POSTGRES_PRISMA_URL: hasDbUrl ? 'Set' : 'Not set',
			DATABASE_URL: process.env.DATABASE_URL
				? 'Set'
				: 'Not set',
			ALLOW_ADMIN_SETUP: process.env.ALLOW_ADMIN_SETUP,
		});

		if (!hasDbUrl) {
			return NextResponse.json(
				{
					success: false,
					error: 'No database URL configured',
					details:
						'Neither POSTGRES_PRISMA_URL nor DATABASE_URL is set',
					environment: {
						NODE_ENV: process.env.NODE_ENV,
						hasPostgresPrismaUrl:
							!!process.env.POSTGRES_PRISMA_URL,
						hasDatabaseUrl: !!process.env.DATABASE_URL,
					},
				},
				{ status: 500 }
			);
		}

		// Test connection with timeout
		const startTime = Date.now();

		try {
			const connectionTest = Promise.race([
				prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`,
				new Promise((_, reject) =>
					setTimeout(
						() =>
							reject(
								new Error(
									'Connection timeout after 10 seconds'
								)
							),
						10000
					)
				),
			]);

			const result = (await connectionTest) as any[];
			const endTime = Date.now();
			const duration = endTime - startTime;

			console.log('✅ Database connection successful', {
				duration,
				result,
			});

			// Test table access
			try {
				const userCount = await prisma.user.count();
				console.log(
					'✅ User table accessible, count:',
					userCount
				);

				return NextResponse.json({
					success: true,
					message: 'Database connection successful',
					details: {
						duration: `${duration}ms`,
						timestamp: new Date().toISOString(),
						userCount,
						dbUrl: dbUrlMasked,
						environment: process.env.NODE_ENV,
					},
				});
			} catch (tableError) {
				console.error(
					'❌ Table access failed:',
					tableError
				);
				return NextResponse.json(
					{
						success: false,
						error:
							'Database connected but table access failed',
						details:
							tableError instanceof Error
								? tableError.message
								: 'Unknown table error',
						suggestion:
							'You may need to run database migrations',
						dbUrl: dbUrlMasked,
					},
					{ status: 500 }
				);
			}
		} catch (connectionError) {
			const endTime = Date.now();
			const duration = endTime - startTime;

			console.error(
				'❌ Database connection failed:',
				connectionError
			);

			const errorMessage =
				connectionError instanceof Error
					? connectionError.message
					: 'Unknown error';

			return NextResponse.json(
				{
					success: false,
					error: 'Database connection failed',
					details: errorMessage,
					duration: `${duration}ms`,
					dbUrl: dbUrlMasked,
					suggestions: [
						'Check if POSTGRES_PRISMA_URL is correctly set',
						'Verify database server is running and accessible',
						'Ensure database credentials are correct',
						'Check if database allows connections from your deployment region',
					],
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('❌ Database test failed:', error);

		return NextResponse.json(
			{
				success: false,
				error: 'Database test failed',
				details:
					error instanceof Error
						? error.message
						: 'Unknown error',
			},
			{ status: 500 }
		);
	} finally {
		// Clean up connection
		try {
			await prisma.$disconnect();
		} catch (disconnectError) {
			console.error(
				'Warning: Error disconnecting from database:',
				disconnectError
			);
		}
	}
}
