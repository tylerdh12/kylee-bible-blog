import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimitConfigs } from '@/lib/utils/rate-limit';
import { auth } from '@/lib/better-auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/auth/forgot-password
 * 
 * Request a password reset email
 * Rate limited to prevent abuse
 */
export async function POST(request: NextRequest) {
	try {
		// Apply rate limiting (3 requests per hour per IP)
		const limiter = rateLimit(rateLimitConfigs.passwordReset);
		const rateLimitResult = limiter(request);

		if (!rateLimitResult.success) {
			const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
			return NextResponse.json(
				{
					error: 'Too many password reset requests. Please try again later.',
					resetTime: rateLimitResult.resetTime,
				},
				{
					status: 429,
					headers: {
						'Retry-After': String(retryAfter),
						'X-RateLimit-Limit': String(rateLimitResult.limit),
						'X-RateLimit-Remaining': String(rateLimitResult.remaining),
						'X-RateLimit-Reset': String(rateLimitResult.resetTime),
					},
				}
			);
		}

		const body = await request.json();
		const { email } = body;

		if (!email || !email.includes('@')) {
			return NextResponse.json(
				{ error: 'Valid email address is required' },
				{ status: 400 }
			);
		}

		// Check if user exists and is not a subscriber
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				isActive: true,
			},
		});

		// Always return success to prevent email enumeration
		// But only send email if user exists and is not a subscriber
		if (user) {
			// Prevent subscribers from resetting password (they can't log in anyway)
			if (user.role === 'SUBSCRIBER' || !user.role) {
				// Return success but don't send email
				return NextResponse.json({
					success: true,
					message: 'If an account with that email exists, we\'ve sent a password reset link.',
				});
			}

			// Check if user is active
			if (!user.isActive) {
				// Return success but don't send email
				return NextResponse.json({
					success: true,
					message: 'If an account with that email exists, we\'ve sent a password reset link.',
				});
			}

			// Use better-auth's requestPasswordReset API
			try {
				const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
				const resetUrl = `${baseURL}/admin/reset-password/confirm`;

				await auth.api.requestPasswordReset({
					body: {
						email: user.email,
						redirectTo: resetUrl,
					},
					headers: request.headers,
				});

				return NextResponse.json({
					success: true,
					message: 'If an account with that email exists, we\'ve sent a password reset link.',
				});
			} catch (resetError: any) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Error requesting password reset:', resetError);
				}
				// Still return success to prevent email enumeration
				return NextResponse.json({
					success: true,
					message: 'If an account with that email exists, we\'ve sent a password reset link.',
				});
			}
		}

		// User doesn't exist - still return success to prevent email enumeration
		return NextResponse.json({
			success: true,
			message: 'If an account with that email exists, we\'ve sent a password reset link.',
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error in forgot password endpoint:', error);
		}
		// Return success even on error to prevent email enumeration
		return NextResponse.json({
			success: true,
			message: 'If an account with that email exists, we\'ve sent a password reset link.',
		});
	}
}
