import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createPrayerRequestSchema } from '@/lib/validation/schemas';
import { createValidationErrorResponse } from '@/lib/validation/schemas';
import { isFeatureEnabled } from '@/lib/settings';

export async function POST(request: NextRequest) {
	try {
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
		const take = parseInt(searchParams.get('take') || '50');
		const page = parseInt(searchParams.get('page') || '0');
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
