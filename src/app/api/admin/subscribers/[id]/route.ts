import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-new';
import { hasPermission } from '@/lib/rbac';

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Authentication check
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
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

		const { id } = await params;

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

		// Send deletion confirmation email before deleting
		try {
			const { getSiteSettings } = await import('@/lib/settings');
			const settings = await getSiteSettings();
			const siteName = settings.siteName || "Kylee's Blog";

			const { sendEmail, generateUnsubscribeEmail } = await import('@/lib/utils/email');
			const { html, text } = generateUnsubscribeEmail(
				siteName,
				true, // Deleted by admin
				subscriber.name || undefined
			);

			// Send email asynchronously (don't wait for it)
			sendEmail({
				to: subscriber.email,
				subject: `Subscription Removed from ${siteName}`,
				html,
				text,
			}).catch((error) => {
				// Log error but don't fail the deletion
				if (process.env.NODE_ENV === 'development') {
					console.error('Failed to send deletion email:', error);
				}
			});
		} catch (error) {
			// Don't fail the deletion if email sending fails
			if (process.env.NODE_ENV === 'development') {
				console.error('Error setting up deletion email:', error);
			}
		}

		await prisma.subscriber.delete({
			where: { id },
		});

		return NextResponse.json({
			message: 'Subscriber deleted successfully',
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Failed to delete subscriber:', error);
		}
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Authentication check
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
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

		const { id } = await params;
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
		if (process.env.NODE_ENV === 'development') {
			console.error('Failed to update subscriber:', error);
		}
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}