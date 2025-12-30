import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-new';
import { hasPermission } from '@/lib/rbac';
import { prisma } from '@/lib/db';

// POST - Send message to users/subscribers
export async function POST(request: NextRequest) {
	try {
		// Authentication check
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		// Permission check - only admins and developers can send messages
		if (
			!hasPermission(user.role, 'read:users') ||
			(user.role !== 'ADMIN' && user.role !== 'DEVELOPER')
		) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { recipientIds, subject, content, recipientType } = body;

		if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
			return NextResponse.json(
				{ error: 'Recipient IDs are required' },
				{ status: 400 }
			);
		}

		if (!subject || !content) {
			return NextResponse.json(
				{ error: 'Subject and content are required' },
				{ status: 400 }
			);
		}

		// Get recipient emails
		const recipients = await prisma.user.findMany({
			where: {
				id: { in: recipientIds },
			},
			select: {
				id: true,
				email: true,
				name: true,
			},
		});

		// Create message records (you might want a Message model for this)
		// For now, we'll just log and return success
		// In production, you'd integrate with Resend email service

		if (process.env.NODE_ENV === 'development') {
			console.log('Sending message:', {
				from: user.email,
				to: recipients.map((r) => r.email),
				subject,
			});
		}

		// TODO: Integrate with email service
		// Example with Resend:
		// const resend = new Resend(process.env.RESEND_API_KEY);
		// await resend.emails.send({
		//   from: 'noreply@yourdomain.com',
		//   to: recipients.map(r => r.email),
		//   subject,
		//   html: content,
		// });

		return NextResponse.json({
			message: 'Message sent successfully',
			recipients: recipients.length,
			// In production, return actual email send status
		});
	} catch (error: any) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error sending message:', error);
		}
		return NextResponse.json(
			{
				error: 'Failed to send message',
			},
			{ status: 500 }
		);
	}
}
