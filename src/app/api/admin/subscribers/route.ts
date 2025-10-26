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

export async function GET(req: NextRequest) {
	try {
		const user = await verifyAuth(req);
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const subscribers = await prisma.subscriber.findMany({
			orderBy: { subscribedAt: 'desc' },
		});

		return NextResponse.json({
			subscribers: subscribers.map(sub => ({
				id: sub.id,
				email: sub.email,
				name: sub.name,
				status: sub.status,
				subscribedAt: sub.subscribedAt.toISOString(),
				lastEmailSent: sub.lastEmailSent?.toISOString(),
				tags: sub.tags ? JSON.parse(sub.tags as string) : [],
			})),
		});
	} catch (error) {
		console.error('Failed to fetch subscribers:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const user = await verifyAuth(req);
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { email, name } = await req.json();

		if (!email || !email.includes('@')) {
			return NextResponse.json(
				{ error: 'Valid email is required' },
				{ status: 400 }
			);
		}

		// Check if subscriber already exists
		const existingSubscriber = await prisma.subscriber.findUnique({
			where: { email },
		});

		if (existingSubscriber) {
			return NextResponse.json(
				{ error: 'Email already subscribed' },
				{ status: 400 }
			);
		}

		const subscriber = await prisma.subscriber.create({
			data: {
				email,
				name: name || null,
				status: 'active',
				tags: '[]',
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
				tags: [],
			},
		});
	} catch (error) {
		console.error('Failed to create subscriber:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}