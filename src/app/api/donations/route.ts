import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';

const db = DatabaseService.getInstance();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const take = parseInt(searchParams.get('take') || '10');

		const donations = await db.findDonations({
			pagination: { page: 0, limit: take },
			sort: { field: 'createdAt', order: 'desc' },
			includeGoal: true,
		});

		return NextResponse.json({ donations });
	} catch (error) {
		console.error('Error fetching donations:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const {
			amount,
			donorName,
			message,
			anonymous,
			goalId,
		} = await request.json();

		if (!amount || amount <= 0) {
			return NextResponse.json(
				{ error: 'Invalid donation amount' },
				{ status: 400 }
			);
		}

		const donation = await db.createDonation({
			amount: parseFloat(amount),
			donorName: anonymous ? null : donorName,
			message: message || null,
			anonymous: Boolean(anonymous),
			goalId: goalId || null,
		});

		return NextResponse.json({ donation }, { status: 201 });
	} catch (error) {
		console.error('Error creating donation:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
