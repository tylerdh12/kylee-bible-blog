import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { DatabaseService } from '@/lib/services/database';

const db = DatabaseService.getInstance();

export async function POST(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { title, description, targetAmount, deadline } =
			await request.json();

		if (!title || !targetAmount || targetAmount <= 0) {
			return NextResponse.json(
				{
					error:
						'Title and valid target amount are required',
				},
				{ status: 400 }
			);
		}

		const goal = await db.createGoal({
			title,
			description: description || null,
			targetAmount: parseFloat(targetAmount),
			currentAmount: 0,
			deadline: deadline ? new Date(deadline) : null,
			completed: false,
		});

		return NextResponse.json({
			message: 'Goal created successfully',
			goal,
		});
	} catch (error) {
		console.error('Error creating goal:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const goals = await db.findGoals({
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
