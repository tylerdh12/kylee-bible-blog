import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		const email = searchParams.get('email');

		if (!id && !email) {
			return NextResponse.json(
				{ error: 'Subscriber ID or email is required' },
				{ status: 400 }
			);
		}

		let subscriber;
		if (id) {
			subscriber = await prisma.subscriber.findUnique({
				where: { id },
			});
		} else if (email) {
			subscriber = await prisma.subscriber.findUnique({
				where: { email: email.toLowerCase().trim() },
			});
		}

		if (!subscriber) {
			return NextResponse.json(
				{ error: 'Subscriber not found' },
				{ status: 404 }
			);
		}

		// Send unsubscription confirmation email before updating status
		try {
			const { getSiteSettings } = await import('@/lib/settings');
			const settings = await getSiteSettings();
			const siteName = settings.siteName || "Kylee's Blog";

			const { sendEmail, generateUnsubscribeEmail } = await import('@/lib/utils/email');
			const { html, text } = generateUnsubscribeEmail(
				siteName,
				false, // Not deleted, user unsubscribed themselves
				subscriber.name || undefined
			);

			// Send email asynchronously (don't wait for it)
			sendEmail({
				to: subscriber.email,
				subject: `Unsubscribed from ${siteName}`,
				html,
				text,
			}).catch((error) => {
				// Log error but don't fail the unsubscribe
				if (process.env.NODE_ENV === 'development') {
					console.error('Failed to send unsubscription email:', error);
				}
			});
		} catch (error) {
			// Don't fail the unsubscribe if email sending fails
			if (process.env.NODE_ENV === 'development') {
				console.error('Error setting up unsubscription email:', error);
			}
		}

		// Update subscriber status to inactive
		await prisma.subscriber.update({
			where: { id: subscriber.id },
			data: { status: 'inactive' },
		});

		return NextResponse.json({
			success: true,
			message: 'Successfully unsubscribed. You will no longer receive email notifications.',
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error unsubscribing:', error);
		}
		return NextResponse.json(
			{ error: 'Failed to unsubscribe. Please try again later.' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, email } = body;

		if (!id && !email) {
			return NextResponse.json(
				{ error: 'Subscriber ID or email is required' },
				{ status: 400 }
			);
		}

		let subscriber;
		if (id) {
			subscriber = await prisma.subscriber.findUnique({
				where: { id },
			});
		} else if (email) {
			subscriber = await prisma.subscriber.findUnique({
				where: { email: email.toLowerCase().trim() },
			});
		}

		if (!subscriber) {
			return NextResponse.json(
				{ error: 'Subscriber not found' },
				{ status: 404 }
			);
		}

		// Send unsubscription confirmation email before updating status
		try {
			const { getSiteSettings } = await import('@/lib/settings');
			const settings = await getSiteSettings();
			const siteName = settings.siteName || "Kylee's Blog";

			const { sendEmail, generateUnsubscribeEmail } = await import('@/lib/utils/email');
			const { html, text } = generateUnsubscribeEmail(
				siteName,
				false, // Not deleted, user unsubscribed themselves
				subscriber.name || undefined
			);

			// Send email asynchronously (don't wait for it)
			sendEmail({
				to: subscriber.email,
				subject: `Unsubscribed from ${siteName}`,
				html,
				text,
			}).catch((error) => {
				// Log error but don't fail the unsubscribe
				if (process.env.NODE_ENV === 'development') {
					console.error('Failed to send unsubscription email:', error);
				}
			});
		} catch (error) {
			// Don't fail the unsubscribe if email sending fails
			if (process.env.NODE_ENV === 'development') {
				console.error('Error setting up unsubscription email:', error);
			}
		}

		// Update subscriber status to inactive
		await prisma.subscriber.update({
			where: { id: subscriber.id },
			data: { status: 'inactive' },
		});

		return NextResponse.json({
			success: true,
			message: 'Successfully unsubscribed. You will no longer receive email notifications.',
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error unsubscribing:', error);
		}
		return NextResponse.json(
			{ error: 'Failed to unsubscribe. Please try again later.' },
			{ status: 500 }
		);
	}
}
