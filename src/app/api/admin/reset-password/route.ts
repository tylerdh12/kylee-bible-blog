import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { auth } from '@/lib/better-auth';

/**
 * POST /api/admin/reset-password
 * 
 * Reset a user's password using better-auth's password hashing
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
	try {
		// Require admin authentication
		const { error, user: adminUser } = await requireAdmin();
		if (error) {
			return error; // Returns error response if not admin
		}
		if (!adminUser) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { email, newPassword } = body;

		if (!email || !email.includes('@')) {
			return NextResponse.json(
				{ error: 'Valid email address is required' },
				{ status: 400 }
			);
		}

		if (!newPassword || newPassword.length < 8) {
			return NextResponse.json(
				{ error: 'Password must be at least 8 characters long' },
				{ status: 400 }
			);
		}

		// Find the user whose password is being reset
		const user = await prisma.user.findUnique({
			where: { email },
			include: {
				accounts: {
					where: { providerId: 'credential' },
				},
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		// Use better-auth's password hashing function
		// This ensures we use the exact same hashing as the authentication system
		const ctx = await auth.$context;
		const hashedPassword = await ctx.password.hash(newPassword);

		// Update or create account
		const account = user.accounts[0];

		if (account) {
			await prisma.account.update({
				where: { id: account.id },
				data: { password: hashedPassword },
			});
		} else {
			await prisma.account.create({
				data: {
					id: `acc_${user.id}`,
					accountId: user.id,
					providerId: 'credential',
					userId: user.id,
					password: hashedPassword,
				},
			});
		}

		return NextResponse.json({
			success: true,
			message: 'Password reset successfully',
			email: user.email,
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error resetting password:', error);
		}
		return NextResponse.json(
			{ error: 'Failed to reset password' },
			{ status: 500 }
		);
	}
}
