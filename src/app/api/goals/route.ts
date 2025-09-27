import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';
import { rateLimit, rateLimitConfigs } from '@/lib/utils/rate-limit';
import type { GoalsResponse, ApiResponse } from '@/types';

const db = DatabaseService.getInstance();
const goalsRateLimit = rateLimit(rateLimitConfigs.goals);

export async function GET(request: NextRequest) {
	try {
		// Apply rate limiting
		const rateLimitResult = goalsRateLimit(request);
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

		const goals = await db.findGoals({
			completed: false,
			includeDonations: true,
			sort: { field: 'createdAt', order: 'desc' },
		});

		const response: GoalsResponse = { goals };
		return NextResponse.json(response, {
			headers: {
				'X-RateLimit-Limit': rateLimitResult.limit.toString(),
				'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
				'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
			}
		});
	} catch (error) {
		// Don't expose internal errors to clients
		console.error('Error fetching goals:', error);
		const errorResponse: ApiResponse = {
			success: false,
			error: 'Internal server error'
		};
		return NextResponse.json(errorResponse, { status: 500 });
	}
}
