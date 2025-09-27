import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';
import { donationQuerySchema, createDonationSchema, createValidationErrorResponse } from '@/lib/validation/schemas';
import { rateLimit, rateLimitConfigs } from '@/lib/utils/rate-limit';
import type { DonationsResponse, ApiResponse } from '@/types';

const db = DatabaseService.getInstance();
const donationsRateLimit = rateLimit(rateLimitConfigs.donations);

export async function GET(request: NextRequest) {
	try {
		// Apply rate limiting
		const rateLimitResult = donationsRateLimit(request);
		if (!rateLimitResult.success) {
			return NextResponse.json(
				{
					error: 'Too many requests',
					message: 'Rate limit exceeded. Please try again later.',
					resetTime: rateLimitResult.resetTime
				},
				{
					status: 429,
					headers: {
						'X-RateLimit-Limit': rateLimitResult.limit.toString(),
						'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
						'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
						'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
					}
				}
			);
		}

		// Validate query parameters
		const { searchParams } = new URL(request.url);
		const queryValidation = donationQuerySchema.safeParse({
			take: searchParams.get('take') || '10',
			page: searchParams.get('page') || '0'
		});

		if (!queryValidation.success) {
			return NextResponse.json(
				createValidationErrorResponse(queryValidation.error),
				{ status: 400 }
			);
		}

		const { take, page } = queryValidation.data;

		const donations = await db.findDonations({
			pagination: { page, limit: take },
			sort: { field: 'createdAt', order: 'desc' },
			includeGoal: true,
		});

		const response: DonationsResponse = { donations };
		return NextResponse.json(response, {
			headers: {
				'X-RateLimit-Limit': rateLimitResult.limit.toString(),
				'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
				'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
			}
		});
	} catch (error) {
		// Don't expose internal errors to clients
		console.error('Error fetching donations:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		// Apply rate limiting (stricter for POST)
		const rateLimitResult = donationsRateLimit(request);
		if (!rateLimitResult.success) {
			return NextResponse.json(
				{
					error: 'Too many requests',
					message: 'Rate limit exceeded. Please try again later.',
					resetTime: rateLimitResult.resetTime
				},
				{
					status: 429,
					headers: {
						'X-RateLimit-Limit': rateLimitResult.limit.toString(),
						'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
						'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
						'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
					}
				}
			);
		}

		// Parse and validate request body
		let requestBody;
		try {
			requestBody = await request.json();
		} catch {
			return NextResponse.json(
				{ error: 'Invalid JSON in request body' },
				{ status: 400 }
			);
		}

		// Validate input data
		const validation = createDonationSchema.safeParse(requestBody);
		if (!validation.success) {
			return NextResponse.json(
				createValidationErrorResponse(validation.error),
				{ status: 400 }
			);
		}

		const { amount, donorName, message, anonymous, goalId } = validation.data;

		// Sanitize text inputs
		const sanitizedDonorName = donorName ? donorName.trim() : null;
		const sanitizedMessage = message ? message.trim() : null;

		const donation = await db.createDonation({
			amount,
			donorName: anonymous ? null : sanitizedDonorName,
			message: sanitizedMessage,
			anonymous,
			goalId: goalId || null,
		});

		return NextResponse.json(
			{ donation },
			{
				status: 201,
				headers: {
					'X-RateLimit-Limit': rateLimitResult.limit.toString(),
					'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
					'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
				}
			}
		);
	} catch (error) {
		// Don't expose internal errors to clients
		console.error('Error creating donation:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
