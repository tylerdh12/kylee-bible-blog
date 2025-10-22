import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
	const startTime = Date.now();

	// Comprehensive diagnostic information
	const diagnostics = {
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV,
		vercel: {
			region: process.env.VERCEL_REGION || 'unknown',
			url: process.env.VERCEL_URL || 'unknown',
		},
		database: {
			url_configured: !!process.env.DATABASE_URL,
			url_format: process.env.DATABASE_URL?.startsWith(
				'postgresql://'
			)
				? 'postgresql'
				: 'unknown',
			url_host: process.env.DATABASE_URL
				? process.env.DATABASE_URL.match(
						/@([^:/?]+)/
				  )?.[1] || 'unknown'
				: 'not_set',
			url_database: process.env.DATABASE_URL
				? process.env.DATABASE_URL.match(
						/\/([^?]+)/
				  )?.[1] || 'unknown'
				: 'not_set',
			expected_host:
				'ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech',
			expected_database: 'neondb',
			host_matches: false,
			database_matches: false,
		},
		prisma: {
			client_version: '6.16.2',
			schema_path: 'prisma/schema.prisma',
		},
		tests: {
			connection: {
				status: 'pending',
				duration: 0,
				error: null as string | null,
			},
			basic_query: {
				status: 'pending',
				duration: 0,
				error: null as string | null,
				result: null as any,
			},
			user_table: {
				status: 'pending',
				duration: 0,
				error: null as string | null,
				count: 0,
			},
			post_table: {
				status: 'pending',
				duration: 0,
				error: null as string | null,
				count: 0,
			},
			goal_table: {
				status: 'pending',
				duration: 0,
				error: null as string | null,
				count: 0,
			},
			sample_data: {
				status: 'pending',
				duration: 0,
				error: null as string | null,
				users: [] as any[],
				posts: [] as any[],
				goals: [] as any[],
			},
		},
	};

	// Check if database URL matches expected Neon configuration
	if (process.env.DATABASE_URL) {
		const url = process.env.DATABASE_URL;
		diagnostics.database.host_matches = url.includes(
			'ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech'
		);
		diagnostics.database.database_matches =
			url.includes('/neondb');
	}

	// Create Prisma client with minimal configuration
	let prisma: PrismaClient | null = null;

	try {
		prisma = new PrismaClient({
			log: ['error'],
		});

		// Test 1: Basic connection
		const connectionStart = Date.now();
		try {
			await prisma.$connect();
			diagnostics.tests.connection.status = 'success';
			diagnostics.tests.connection.duration =
				Date.now() - connectionStart;
		} catch (error) {
			diagnostics.tests.connection.status = 'failed';
			diagnostics.tests.connection.duration =
				Date.now() - connectionStart;
			diagnostics.tests.connection.error =
				error instanceof Error
					? error.message
					: String(error);
		}

		// Test 2: Basic query
		if (diagnostics.tests.connection.status === 'success') {
			const queryStart = Date.now();
			try {
				const result = await prisma.$queryRaw`
					SELECT 
						NOW() as current_time,
						version() as postgres_version,
						current_database() as database_name,
						current_user as current_user,
						inet_server_addr() as server_ip
				`;
				diagnostics.tests.basic_query.status = 'success';
				diagnostics.tests.basic_query.duration =
					Date.now() - queryStart;
				diagnostics.tests.basic_query.result = (
					result as any[]
				)[0];
			} catch (error) {
				diagnostics.tests.basic_query.status = 'failed';
				diagnostics.tests.basic_query.duration =
					Date.now() - queryStart;
				diagnostics.tests.basic_query.error =
					error instanceof Error
						? error.message
						: String(error);
			}
		}

		// Test 3: User table access
		if (diagnostics.tests.connection.status === 'success') {
			const userStart = Date.now();
			try {
				const userCount = await prisma.user.count();
				diagnostics.tests.user_table.status = 'success';
				diagnostics.tests.user_table.duration =
					Date.now() - userStart;
				diagnostics.tests.user_table.count = userCount;
			} catch (error) {
				diagnostics.tests.user_table.status = 'failed';
				diagnostics.tests.user_table.duration =
					Date.now() - userStart;
				diagnostics.tests.user_table.error =
					error instanceof Error
						? error.message
						: String(error);
			}
		}

		// Test 4: Post table access
		if (diagnostics.tests.connection.status === 'success') {
			const postStart = Date.now();
			try {
				const postCount = await prisma.post.count();
				diagnostics.tests.post_table.status = 'success';
				diagnostics.tests.post_table.duration =
					Date.now() - postStart;
				diagnostics.tests.post_table.count = postCount;
			} catch (error) {
				diagnostics.tests.post_table.status = 'failed';
				diagnostics.tests.post_table.duration =
					Date.now() - postStart;
				diagnostics.tests.post_table.error =
					error instanceof Error
						? error.message
						: String(error);
			}
		}

		// Test 5: Goal table access
		if (diagnostics.tests.connection.status === 'success') {
			const goalStart = Date.now();
			try {
				const goalCount = await prisma.goal.count();
				diagnostics.tests.goal_table.status = 'success';
				diagnostics.tests.goal_table.duration =
					Date.now() - goalStart;
				diagnostics.tests.goal_table.count = goalCount;
			} catch (error) {
				diagnostics.tests.goal_table.status = 'failed';
				diagnostics.tests.goal_table.duration =
					Date.now() - goalStart;
				diagnostics.tests.goal_table.error =
					error instanceof Error
						? error.message
						: String(error);
			}
		}

		// Test 6: Sample data retrieval
		if (diagnostics.tests.connection.status === 'success') {
			const sampleStart = Date.now();
			try {
				const [users, posts, goals] = await Promise.all([
					prisma.user.findMany({
						take: 3,
						select: {
							id: true,
							email: true,
							name: true,
							role: true,
							createdAt: true,
						},
					}),
					prisma.post.findMany({
						take: 3,
						select: {
							id: true,
							title: true,
							slug: true,
							published: true,
							createdAt: true,
						},
					}),
					prisma.goal.findMany({
						take: 3,
						select: {
							id: true,
							title: true,
							targetAmount: true,
							currentAmount: true,
							createdAt: true,
						},
					}),
				]);

				diagnostics.tests.sample_data.status = 'success';
				diagnostics.tests.sample_data.duration =
					Date.now() - sampleStart;
				diagnostics.tests.sample_data.users = users;
				diagnostics.tests.sample_data.posts = posts;
				diagnostics.tests.sample_data.goals = goals;
			} catch (error) {
				diagnostics.tests.sample_data.status = 'failed';
				diagnostics.tests.sample_data.duration =
					Date.now() - sampleStart;
				diagnostics.tests.sample_data.error =
					error instanceof Error
						? error.message
						: String(error);
			}
		}
	} catch (error) {
		diagnostics.tests.connection.status = 'failed';
		diagnostics.tests.connection.error =
			error instanceof Error
				? error.message
				: String(error);
	} finally {
		if (prisma) {
			try {
				await prisma.$disconnect();
			} catch (disconnectError) {
				console.error('Disconnect error:', disconnectError);
			}
		}
	}

	// Calculate total diagnostic time
	const totalDuration = Date.now() - startTime;

	// Determine overall status
	const hasConnection =
		diagnostics.tests.connection.status === 'success';
	const hasTableAccess =
		diagnostics.tests.user_table.status === 'success';
	const hasData =
		diagnostics.tests.sample_data.status === 'success';

	let overallStatus = 'failed';
	if (hasConnection && hasTableAccess && hasData) {
		overallStatus = 'healthy';
	} else if (hasConnection && hasTableAccess) {
		overallStatus = 'connected_no_data';
	} else if (hasConnection) {
		overallStatus = 'connected_no_tables';
	}

	// Generate recommendations
	const recommendations = [];

	if (!diagnostics.database.url_configured) {
		recommendations.push(
			'❌ Set DATABASE_URL environment variable in Vercel'
		);
	}

	if (!diagnostics.database.host_matches) {
		recommendations.push(
			'❌ DATABASE_URL host does not match expected Neon host'
		);
	}

	if (!diagnostics.database.database_matches) {
		recommendations.push(
			'❌ DATABASE_URL database does not match expected "neondb"'
		);
	}

	if (diagnostics.tests.connection.status === 'failed') {
		recommendations.push(
			'❌ Database connection failed - check URL and network access'
		);
	}

	if (diagnostics.tests.user_table.status === 'failed') {
		recommendations.push(
			'❌ Database tables not accessible - run migrations'
		);
	}

	if (
		hasTableAccess &&
		diagnostics.tests.user_table.count === 0
	) {
		recommendations.push(
			'⚠️ No users found - run database seeding or admin setup'
		);
	}

	if (recommendations.length === 0) {
		recommendations.push('✅ All systems operational');
	}

	return NextResponse.json(
		{
			overall_status: overallStatus,
			total_duration: `${totalDuration}ms`,
			diagnostics,
			recommendations,
			next_steps:
				overallStatus === 'healthy'
					? [
							'✅ Database is working correctly',
							'✅ You can access your data through the admin panel',
							'✅ Visit /admin to manage your content',
					  ]
					: [
							'1. Check Vercel environment variables',
							'2. Verify DATABASE_URL is correctly set',
							'3. Run database migrations if needed',
							'4. Contact support if issues persist',
					  ],
		},
		{
			status: overallStatus === 'healthy' ? 200 : 503,
			headers: {
				'Cache-Control':
					'no-cache, no-store, must-revalidate',
			},
		}
	);
}
