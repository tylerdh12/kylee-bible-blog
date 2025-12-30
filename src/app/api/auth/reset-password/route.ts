import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';

/**
 * POST /api/auth/reset-password
 * 
 * Reset password using token from email
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token, newPassword } = body;

		if (!token) {
			return NextResponse.json(
				{ error: 'Reset token is required' },
				{ status: 400 }
			);
		}

		if (!newPassword || newPassword.length < 8) {
			return NextResponse.json(
				{ error: 'Password must be at least 8 characters long' },
				{ status: 400 }
			);
		}

		// Use better-auth's resetPassword API
		try {
			const result = await auth.api.resetPassword({
				body: {
					token,
					newPassword,
				},
				headers: request.headers,
			});

			if (result) {
				return NextResponse.json({
					success: true,
					message: 'Password reset successfully',
				});
			} else {
				return NextResponse.json(
					{ error: 'Invalid or expired reset token' },
					{ status: 400 }
				);
			}
		} catch (resetError: any) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Error resetting password:', resetError);
			}
			return NextResponse.json(
				{
					error: 'Failed to reset password. The link may have expired.',
				},
				{ status: 400 }
			);
		}
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error in reset password endpoint:', error);
		}
		return NextResponse.json(
			{ error: 'An unexpected error occurred' },
			{ status: 500 }
		);
	}
}
