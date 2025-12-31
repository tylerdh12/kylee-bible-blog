import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";

export async function GET() {
	try {
		// Security: Only allow in development or for authenticated admins
		if (process.env.NODE_ENV === 'production') {
			// Require admin authentication in production
			const { error, user } = await requireAdmin();
			if (error) {
				return error;
			}
			if (!user) {
				return NextResponse.json(
					{ error: 'Admin access required' },
					{ status: 401 }
				);
			}
		}

		// Test database connection
		await prisma.$connect();

		// Check if tables exist by trying to query them
		const userCount = await prisma.user.count().catch(() => -1);
		const sessionCount = await prisma.session.count().catch(() => -1);
		const accountCount = await prisma.account.count().catch(() => -1);
		const verificationCount = await prisma.verification.count().catch(() => -1);

		return NextResponse.json({
			connected: true,
			tables: {
				User: userCount >= 0 ? "exists" : "missing",
				Session: sessionCount >= 0 ? "exists" : "missing",
				Account: accountCount >= 0 ? "exists" : "missing",
				Verification: verificationCount >= 0 ? "exists" : "missing",
			},
			counts: {
				users: userCount,
				sessions: sessionCount,
				accounts: accountCount,
				verifications: verificationCount,
			},
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error("Database test error:", error);
		}
		return NextResponse.json(
			{
				connected: false,
				error: 'Database connection failed',
			},
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect().catch(() => {});
	}
}
