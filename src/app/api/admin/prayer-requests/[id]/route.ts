import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const { isRead } = body;

		if (typeof isRead !== 'boolean') {
			return NextResponse.json(
				{ error: 'isRead must be a boolean' },
				{ status: 400 }
			);
		}

		const prayerRequest = await prisma.prayerRequest.update(
			{
				where: { id },
				data: { isRead },
			}
		);

		return NextResponse.json({ prayerRequest });
	} catch (error) {
		console.error('Error updating prayer request:', error);
		return NextResponse.json(
			{ error: 'Failed to update prayer request' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		await prisma.prayerRequest.delete({
			where: { id },
		});

		return NextResponse.json({
			message: 'Prayer request deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting prayer request:', error);
		return NextResponse.json(
			{ error: 'Failed to delete prayer request' },
			{ status: 500 }
		);
	}
}
