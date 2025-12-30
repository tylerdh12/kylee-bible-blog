import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-new';
import { hasPermission } from '@/lib/rbac';

// GET - List all subscribers (admin only)
export async function GET(req: NextRequest) {
	try {
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Permission check
		if (!hasPermission(user.role, 'read:users')) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
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
		if (process.env.NODE_ENV === 'development') {
			console.error('Failed to fetch subscribers:', error);
		}
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// POST - Create new subscriber (admin only)
export async function POST(req: NextRequest) {
	try {
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Permission check
		if (!hasPermission(user.role, 'write:users')) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
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
		if (process.env.NODE_ENV === 'development') {
			console.error('Failed to create subscriber:', error);
		}
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
