/**
 * Email utility functions
 *
 * This module provides email sending functionality.
 * Uses Resend for production email sending.
 * In development, logs to console with clickable reset links.
 */

interface EmailOptions {
	to: string;
	subject: string;
	html?: string;
	text?: string;
}

/**
 * Send an email
 *
 * In development, logs to console with clickable reset links.
 * In production, uses Resend if configured.
 */
export async function sendEmail(
	options: EmailOptions
): Promise<void> {
	const { to, subject, html, text } = options;

	// Extract reset URL from HTML or text for development display
	const urlMatch =
		html?.match(/href="([^"]+)"/) ||
		text?.match(/(https?:\/\/[^\s]+)/);
	const resetUrl = urlMatch ? urlMatch[1] : null;

	// Try to use Resend if API key is configured
	if (process.env.RESEND_API_KEY) {
		try {
			// Dynamic import - Resend is now installed, so this will work in production
			const resendModule = await import('resend');
			const Resend =
				resendModule.Resend ||
				resendModule.default?.Resend ||
				resendModule.default;
			if (Resend) {
				const resend = new Resend(
					process.env.RESEND_API_KEY
				);

				// Get admin email from settings as fallback
				let adminEmail: string | undefined;
				try {
					const { getSiteSettings } = await import('@/lib/settings');
					const settings = await getSiteSettings();
					adminEmail = settings.adminEmail || undefined;
				} catch (error) {
					// If settings can't be loaded, continue with env vars
					console.warn('Could not load admin email from settings:', error);
				}

				// Prepare email payload - Resend requires at least html or text
				const emailPayload: {
					from: string;
					to: string;
					subject: string;
					html?: string;
					text?: string;
					replyTo?: string;
				} = {
					from:
						process.env.EMAIL_FROM ||
						process.env.RESEND_FROM_EMAIL ||
						process.env.RESEND_FROM ||
						adminEmail ||
						'noreply@yourdomain.com',
					to,
					subject,
					...(adminEmail && { replyTo: adminEmail }),
				};

				// Add html/text content - at least one is required
				if (html) {
					emailPayload.html = html;
				}
				if (text) {
					emailPayload.text = text;
				}

				// Ensure we have at least html or text
				if (!emailPayload.html && !emailPayload.text) {
					emailPayload.text = subject; // Fallback to subject as text
				}

				await resend.emails.send(emailPayload as any);

				if (process.env.NODE_ENV === 'development') {
					console.log(
						`✅ Password reset email sent to ${to}`
					);
				}
				return;
			}
		} catch (resendError: any) {
			// Only log if it's not a module not found error (expected when package isn't installed)
			if (
				process.env.NODE_ENV === 'development' &&
				resendError?.code !== 'MODULE_NOT_FOUND' &&
				!resendError?.message?.includes(
					'Cannot find module'
				)
			) {
				console.error('Resend error:', resendError);
			}
			// Fall through to console logging in development
		}
	}

	// In development or if no email service configured, log to console with clickable link
	if (
		process.env.NODE_ENV === 'development' ||
		!process.env.RESEND_API_KEY
	) {
		console.log('\n');
		console.log(
			'═══════════════════════════════════════════════════════════'
		);
		console.log('📧 PASSWORD RESET EMAIL');
		console.log(
			'═══════════════════════════════════════════════════════════'
		);
		console.log(`To: ${to}`);
		console.log(`Subject: ${subject}`);
		if (resetUrl) {
			console.log('\n');
			console.log('🔗 RESET LINK (copy this URL to test):');
			console.log('   ' + resetUrl);
			console.log('\n');
			console.log(
				'💡 TIP: In development, copy the link above and paste it in your browser'
			);
			console.log(
				'   to test the password reset flow without checking email.'
			);
		}
		if (text) {
			console.log('\n--- Email Text Content ---');
			console.log(text);
		}
		console.log(
			'═══════════════════════════════════════════════════════════'
		);
		console.log('\n');

		// In production without email service, warn but don't fail
		if (process.env.NODE_ENV === 'production') {
			console.warn(
				'⚠️  Email service not configured. Set RESEND_API_KEY to send real emails.'
			);
		}
	}
}

/**
 * Generate HTML email template for password reset
 */
export function generatePasswordResetEmail(
	resetUrl: string,
	userName?: string
): { html: string; text: string } {
	const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
		<h1 style="color: #2563eb; margin-top: 0;">Reset Your Password</h1>
		<p>Hello${userName ? ` ${userName}` : ''},</p>
		<p>We received a request to reset your password. Click the button below to reset it:</p>
		<div style="text-align: center; margin: 30px 0;">
			<a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
		</div>
		<p>Or copy and paste this link into your browser:</p>
		<p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
		<p style="color: #666; font-size: 14px; margin-top: 30px;">
			<strong>This link will expire in 1 hour.</strong>
		</p>
		<p style="color: #666; font-size: 14px;">
			If you didn't request a password reset, you can safely ignore this email.
		</p>
	</div>
</body>
</html>
	`.trim();

	const text = `
Reset Your Password

Hello${userName ? ` ${userName}` : ''},

We received a request to reset your password. Click the link below to reset it:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.
	`.trim();

	return { html, text };
}

/**
 * Generate HTML email template for new post notification
 */
export function generateNewPostEmail(
	postTitle: string,
	postExcerpt: string | null,
	postUrl: string,
	siteName: string,
	unsubscribeUrl: string,
	subscriberName?: string
): { html: string; text: string } {
	const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>New Post: ${postTitle}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
		<h1 style="color: #2563eb; margin-top: 0;">New Post: ${postTitle}</h1>
		<p>Hello${subscriberName ? ` ${subscriberName}` : ' there'},</p>
		<p>A new post has been published on ${siteName}!</p>
		${postExcerpt ? `<p style="background-color: #ffffff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; font-style: italic;">${postExcerpt}</p>` : ''}
		<div style="text-align: center; margin: 30px 0;">
			<a href="${postUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Read Full Post</a>
		</div>
		<p>Or copy and paste this link into your browser:</p>
		<p style="word-break: break-all; color: #666; font-size: 14px;">${postUrl}</p>
		<p style="color: #666; font-size: 14px; margin-top: 30px;">
			Thank you for subscribing to ${siteName}!
		</p>
		<p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
			<strong>Manage Your Subscription</strong><br>
			If you no longer wish to receive these emails, you can 
			<a href="${unsubscribeUrl}" style="color: #2563eb; text-decoration: underline;">unsubscribe here</a>.
		</p>
		<p style="color: #999; font-size: 12px; margin-top: 20px;">
			You're receiving this email because you subscribed to receive notifications about new posts.
		</p>
	</div>
</body>
</html>
	`.trim();

	const text = `
New Post: ${postTitle}

Hello${subscriberName ? ` ${subscriberName}` : ' there'},

A new post has been published on ${siteName}!

${postExcerpt ? `\n${postExcerpt}\n` : ''}

Read the full post here: ${postUrl}

Thank you for subscribing to ${siteName}!

Manage Your Subscription
If you no longer wish to receive these emails, you can unsubscribe here: ${unsubscribeUrl}

---
You're receiving this email because you subscribed to receive notifications about new posts.
	`.trim();

	return { html, text };
}

/**
 * Generate HTML email template for welcome/subscription confirmation
 */
export function generateWelcomeEmail(
	siteName: string,
	unsubscribeUrl: string,
	subscriberName?: string
): { html: string; text: string } {
	const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Welcome to ${siteName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
		<h1 style="color: #2563eb; margin-top: 0;">Welcome to ${siteName}!</h1>
		<p>Hello${subscriberName ? ` ${subscriberName}` : ' there'},</p>
		<p>Thank you for subscribing! You're all set to receive email notifications whenever new posts are published.</p>
		<p>We're excited to share our latest Bible studies, spiritual insights, and faith journey with you.</p>
		<p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
			<strong>Manage Your Subscription</strong><br>
			If you no longer wish to receive these emails, you can 
			<a href="${unsubscribeUrl}" style="color: #2563eb; text-decoration: underline;">unsubscribe here</a>.
		</p>
		<p style="color: #999; font-size: 12px; margin-top: 20px;">
			You're receiving this email because you subscribed to receive notifications about new posts from ${siteName}.
		</p>
	</div>
</body>
</html>
	`.trim();

	const text = `
Welcome to ${siteName}!

Hello${subscriberName ? ` ${subscriberName}` : ' there'},

Thank you for subscribing! You're all set to receive email notifications whenever new posts are published.

We're excited to share our latest Bible studies, spiritual insights, and faith journey with you.

Manage Your Subscription
If you no longer wish to receive these emails, you can unsubscribe here: ${unsubscribeUrl}

---
You're receiving this email because you subscribed to receive notifications about new posts from ${siteName}.
	`.trim();

	return { html, text };
}

/**
 * Generate HTML email template for unsubscription/deletion confirmation
 */
export function generateUnsubscribeEmail(
	siteName: string,
	isDeleted: boolean,
	subscriberName?: string
): { html: string; text: string } {
	const action = isDeleted ? 'removed from' : 'unsubscribed from';
	const actionText = isDeleted 
		? 'Your subscription has been removed by an administrator.' 
		: 'You have successfully unsubscribed from our mailing list.';
	const reason = isDeleted
		? 'If you believe this was done in error, please contact us.'
		: 'You can resubscribe at any time by visiting our website.';

	const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Unsubscribed from ${siteName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
		<h1 style="color: #2563eb; margin-top: 0;">Subscription ${isDeleted ? 'Removed' : 'Cancelled'}</h1>
		<p>Hello${subscriberName ? ` ${subscriberName}` : ' there'},</p>
		<p>${actionText}</p>
		<p>You will no longer receive email notifications about new posts from ${siteName}.</p>
		${!isDeleted ? `
		<p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
			<strong>Resubscribe</strong><br>
			If you change your mind, you can resubscribe at any time by visiting our website and using the subscription form.
		</p>
		` : `
		<p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
			${reason}
		</p>
		`}
		<p style="color: #999; font-size: 12px; margin-top: 20px;">
			Thank you for being part of our community. We're sorry to see you go!
		</p>
	</div>
</body>
</html>
	`.trim();

	const text = `
Subscription ${isDeleted ? 'Removed' : 'Cancelled'}

Hello${subscriberName ? ` ${subscriberName}` : ' there'},

${actionText}

You will no longer receive email notifications about new posts from ${siteName}.

${!isDeleted ? `
Resubscribe
If you change your mind, you can resubscribe at any time by visiting our website and using the subscription form.
` : reason}

---
Thank you for being part of our community. We're sorry to see you go!
	`.trim();

	return { html, text };
}

/**
 * Send new post notification to all active subscribers
 */
export async function sendNewPostNotifications(
	postTitle: string,
	postExcerpt: string | null,
	postUrl: string,
	siteName: string
): Promise<void> {
	try {
		const { prisma } = await import('@/lib/db');
		
		// Get all active subscribers
		const subscribers = await prisma.subscriber.findMany({
			where: {
				status: 'active',
			},
		});

		if (subscribers.length === 0) {
			if (process.env.NODE_ENV === 'development') {
				console.log('No active subscribers to notify');
			}
			return;
		}

		// Get site URL for unsubscribe links
		const { getSiteSettings } = await import('@/lib/settings');
		const settings = await getSiteSettings();
		const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

		// Send email to each subscriber
		const emailPromises = subscribers.map(async (subscriber) => {
			try {
				// Create unsubscribe URL with subscriber ID
				const unsubscribeUrl = `${siteUrl}/unsubscribe?id=${subscriber.id}`;
				
				const { html, text } = generateNewPostEmail(
					postTitle,
					postExcerpt,
					postUrl,
					siteName,
					unsubscribeUrl,
					subscriber.name || undefined
				);

				await sendEmail({
					to: subscriber.email,
					subject: `New Post: ${postTitle}`,
					html,
					text,
				});

				// Update lastEmailSent timestamp
				await prisma.subscriber.update({
					where: { id: subscriber.id },
					data: { lastEmailSent: new Date() },
				});
			} catch (error) {
				// Log error but continue with other subscribers
				if (process.env.NODE_ENV === 'development') {
					console.error(`Failed to send notification to ${subscriber.email}:`, error);
				}
			}
		});

		// Wait for all emails to be sent (or fail)
		await Promise.allSettled(emailPromises);

		if (process.env.NODE_ENV === 'development') {
			console.log(`✅ Sent new post notifications to ${subscribers.length} subscribers`);
		}
	} catch (error) {
		// Don't throw - email notifications shouldn't break post creation
		if (process.env.NODE_ENV === 'development') {
			console.error('Error sending new post notifications:', error);
		}
	}
}
