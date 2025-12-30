import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import bcryptjs from 'bcryptjs';

/**
 * POST /api/admin/reset-password
 * 
 * Reset a user's password using better-auth's password hashing
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
	try {
		// Require admin authentication
		const adminCheck = await requireAdmin(request);
		if (adminCheck) {
			return adminCheck; // Returns error response if not admin
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

		// Find the user
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

		// Use bcryptjs directly to avoid spawn EBADF errors with auth.$context
		// better-auth uses bcrypt internally, so this is compatible
		const hashedPassword = await bcryptjs.hash(newPassword, 12);

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
