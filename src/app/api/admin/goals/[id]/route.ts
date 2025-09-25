import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { DatabaseService } from '@/lib/services/database';

const db = DatabaseService.getInstance();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const goal = await db.findGoalById(id);
		if (!goal) {
			return NextResponse.json(
				{ error: 'Goal not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ goal });
	} catch (error) {
		console.error('Error fetching goal:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const {
			title,
			description,
			targetAmount,
			deadline,
			completed,
		} = await request.json();

		if (!title || !targetAmount || targetAmount <= 0) {
			return NextResponse.json(
				{
					error:
						'Title and valid target amount are required',
				},
				{ status: 400 }
			);
		}

		const { id } = await params;
		const goal = await db.updateGoal(id, {
			title,
			description: description || null,
			targetAmount: parseFloat(targetAmount),
			deadline: deadline ? new Date(deadline) : null,
			completed: Boolean(completed),
		});

		if (!goal) {
			return NextResponse.json(
				{ error: 'Goal not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: 'Goal updated successfully',
			goal,
		});
	} catch (error) {
		console.error('Error updating goal:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const success = await db.deleteGoal(id);
		if (!success) {
			return NextResponse.json(
				{ error: 'Goal not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: 'Goal deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting goal:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
