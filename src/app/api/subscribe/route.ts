import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimit, rateLimitConfigs } from '@/lib/utils/rate-limit';

const subscribeRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	maxRequests: 5, // Allow 5 subscription attempts per hour
});

export async function POST(request: NextRequest) {
	try {
		// Apply rate limiting
		const rateLimitResult = subscribeRateLimit(request);
		if (!rateLimitResult.success) {
			return NextResponse.json(
				{
					error: 'Too many requests',
					message: 'Please try again later.',
					resetTime: rateLimitResult.resetTime,
				},
				{
					status: 429,
					headers: {
						'X-RateLimit-Limit': rateLimitResult.limit.toString(),
						'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
						'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
						'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
					},
				}
			);
		}

		const body = await request.json();
		const { email, name } = body;

		// Validate email
		if (!email || !email.includes('@') || !email.includes('.')) {
			return NextResponse.json(
				{ error: 'Valid email address is required' },
				{ status: 400 }
			);
		}

		// Normalize email
		const normalizedEmail = email.toLowerCase().trim();

		// Check if subscriber already exists
		const existingSubscriber = await prisma.subscriber.findUnique({
			where: { email: normalizedEmail },
		});

		if (existingSubscriber) {
			// If already subscribed and active, return success (don't reveal if email exists)
			if (existingSubscriber.status === 'active') {
				return NextResponse.json({
					success: true,
					message: 'You are already subscribed!',
				});
			}

			// Reactivate if inactive
			const updatedSubscriber = await prisma.subscriber.update({
				where: { id: existingSubscriber.id },
				data: {
					status: 'active',
					name: name?.trim() || existingSubscriber.name,
					subscribedAt: new Date(),
				},
			});

			// Send welcome email for reactivated subscribers
			try {
				const { getSiteSettings } = await import('@/lib/settings');
				const settings = await getSiteSettings();
				const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
				const siteName = settings.siteName || "Kylee's Blog";
				const unsubscribeUrl = `${siteUrl}/unsubscribe?id=${updatedSubscriber.id}`;

				const { sendEmail, generateWelcomeEmail } = await import('@/lib/utils/email');
				const { html, text } = generateWelcomeEmail(
					siteName,
					unsubscribeUrl,
					updatedSubscriber.name || undefined
				);

				// Send welcome email asynchronously (don't wait for it)
				sendEmail({
					to: updatedSubscriber.email,
					subject: `Welcome back to ${siteName}!`,
					html,
					text,
				}).catch((error) => {
					// Log error but don't fail the subscription
					if (process.env.NODE_ENV === 'development') {
						console.error('Failed to send welcome email:', error);
					}
				});
			} catch (error) {
				// Don't fail the subscription if email sending fails
				if (process.env.NODE_ENV === 'development') {
					console.error('Error setting up welcome email:', error);
				}
			}

			return NextResponse.json({
				success: true,
				message: 'Subscription reactivated successfully! Check your email for a confirmation message.',
			});
		}

		// Create new subscriber
		const subscriber = await prisma.subscriber.create({
			data: {
				email: normalizedEmail,
				name: name?.trim() || null,
				status: 'active',
				tags: '[]',
			},
		});

		// Send welcome email
		try {
			const { getSiteSettings } = await import('@/lib/settings');
			const settings = await getSiteSettings();
			const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
			const siteName = settings.siteName || "Kylee's Blog";
			const unsubscribeUrl = `${siteUrl}/unsubscribe?id=${subscriber.id}`;

			const { sendEmail, generateWelcomeEmail } = await import('@/lib/utils/email');
			const { html, text } = generateWelcomeEmail(
				siteName,
				unsubscribeUrl,
				subscriber.name || undefined
			);

			// Send welcome email asynchronously (don't wait for it)
			sendEmail({
				to: subscriber.email,
				subject: `Welcome to ${siteName}!`,
				html,
				text,
			}).catch((error) => {
				// Log error but don't fail the subscription
				if (process.env.NODE_ENV === 'development') {
					console.error('Failed to send welcome email:', error);
				}
			});
		} catch (error) {
			// Don't fail the subscription if email sending fails
			if (process.env.NODE_ENV === 'development') {
				console.error('Error setting up welcome email:', error);
			}
		}

		return NextResponse.json({
			success: true,
			message: 'Successfully subscribed! Check your email for a confirmation message.',
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error subscribing:', error);
		}
		return NextResponse.json(
			{ error: 'Failed to subscribe. Please try again later.' },
			{ status: 500 }
		);
	}
}
