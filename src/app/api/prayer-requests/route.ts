import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createPrayerRequestSchema } from '@/lib/validation/schemas';
import { createValidationErrorResponse } from '@/lib/validation/schemas';
import { isFeatureEnabled } from '@/lib/settings';
import { rateLimit } from '@/lib/utils/rate-limit';

// Rate limiting for prayer requests (stricter than donations)
const prayerRequestRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	maxRequests: 5, // 5 requests per hour per IP
});

export async function POST(request: NextRequest) {
	try {
		// Apply rate limiting to prevent spam
		const rateLimitResult = prayerRequestRateLimit(request);
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

		// Check if prayer requests are enabled
		const enabled = await isFeatureEnabled('prayerRequests');
		if (!enabled) {
			return NextResponse.json(
				{ error: 'Prayer requests are currently disabled' },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const validation =
			createPrayerRequestSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				createValidationErrorResponse(validation.error),
				{ status: 400 }
			);
		}

		const { name, email, request: requestText, isPrivate } =
			validation.data;

		const prayerRequest = await prisma.prayerRequest.create(
			{
				data: {
					name: name || null,
					email: email || null,
					request: requestText,
					isPrivate: isPrivate ?? true,
				},
			}
		);

		return NextResponse.json(
			{
				message: 'Prayer request submitted successfully',
				prayerRequest: {
					id: prayerRequest.id,
					createdAt: prayerRequest.createdAt,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating prayer request:', error);
		return NextResponse.json(
			{ error: 'Failed to submit prayer request' },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const take = Math.min(parseInt(searchParams.get('take') || '50'), 100); // Max 100
		const page = Math.max(parseInt(searchParams.get('page') || '0'), 0); // Min 0
		const skip = page * take;

		// Security: Only return public prayer requests for public API
		// Private prayer requests should only be accessible via admin endpoint
		const [prayerRequests, total] = await Promise.all([
			prisma.prayerRequest.findMany({
				where: {
					isPrivate: false, // Only return public requests
				},
				select: {
					id: true,
					name: true,
					request: true,
					createdAt: true,
					// Exclude email for privacy
				},
				skip,
				take,
				orderBy: { createdAt: 'desc' },
			}),
			prisma.prayerRequest.count({
				where: { isPrivate: false },
			}),
		]);

		return NextResponse.json({
			prayerRequests,
			total,
			page,
			take,
		});
	} catch (error) {
		console.error('Error fetching prayer requests:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch prayer requests' },
			{ status: 500 }
		);
	}
}
