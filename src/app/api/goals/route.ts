import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';

const db = DatabaseService.getInstance();

export async function GET() {
	try {
		const goals = await db.findGoals({
			completed: false,
			includeDonations: true,
			sort: { field: 'createdAt', order: 'desc' },
		});

		return NextResponse.json({ goals });
	} catch (error) {
		console.error('Error fetching goals:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
