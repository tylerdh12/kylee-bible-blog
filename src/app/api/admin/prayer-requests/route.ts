import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { prayerRequestQuerySchema } from '@/lib/validation/schemas';
import { createValidationErrorResponse } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const validation = prayerRequestQuerySchema.safeParse({
			take: searchParams.get('take') || '50',
			page: searchParams.get('page') || '0',
		});

		if (!validation.success) {
			return NextResponse.json(
				createValidationErrorResponse(validation.error),
				{ status: 400 }
			);
		}

		const { take, page } = validation.data;
		const skip = page * take;

		const [prayerRequests, total] = await Promise.all([
			prisma.prayerRequest.findMany({
				skip,
				take,
				orderBy: { createdAt: 'desc' },
			}),
			prisma.prayerRequest.count(),
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
