import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function verifyAuth(req: NextRequest) {
	try {
		const token = req.cookies.get('auth_token')?.value;
		if (!token) {
			return null;
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: string;
		};
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
		});

		if (!user || user.role !== 'ADMIN') {
			return null;
		}

		return user;
	} catch {
		return null;
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await verifyAuth(req);
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { id } = params;

		// Check if subscriber exists
		const subscriber = await prisma.subscriber.findUnique({
			where: { id },
		});

		if (!subscriber) {
			return NextResponse.json(
				{ error: 'Subscriber not found' },
				{ status: 404 }
			);
		}

		await prisma.subscriber.delete({
			where: { id },
		});

		return NextResponse.json({
			message: 'Subscriber deleted successfully',
		});
	} catch (error) {
		console.error('Failed to delete subscriber:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await verifyAuth(req);
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { id } = params;
		const { name, status } = await req.json();

		// Check if subscriber exists
		const existingSubscriber = await prisma.subscriber.findUnique({
			where: { id },
		});

		if (!existingSubscriber) {
			return NextResponse.json(
				{ error: 'Subscriber not found' },
				{ status: 404 }
			);
		}

		const subscriber = await prisma.subscriber.update({
			where: { id },
			data: {
				name: name || null,
				status: status || existingSubscriber.status,
			},
		});

		return NextResponse.json({
			subscriber: {
				id: subscriber.id,
				email: subscriber.email,
				name: subscriber.name,
				status: subscriber.status,
				subscribedAt: subscriber.subscribedAt.toISOString(),
				lastEmailSent: subscriber.lastEmailSent?.toISOString(),
				tags: subscriber.tags ? JSON.parse(subscriber.tags as string) : [],
			},
		});
	} catch (error) {
		console.error('Failed to update subscriber:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}