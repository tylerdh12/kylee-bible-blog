import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-new';
import { DatabaseService } from '@/lib/services/database';
import { sanitizeHtml, sanitizeText } from '@/lib/utils/sanitize';
import type { PostsResponse } from '@/types';

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

		const { title, content, excerpt, published, tags } =
			await request.json();

		if (!title?.trim() || !content?.trim()) {
			return NextResponse.json(
				{ error: 'Title and content are required' },
				{ status: 400 }
			);
		}

		// Sanitize inputs to prevent XSS
		const sanitizedTitle = sanitizeText(title);
		const sanitizedContent = sanitizeHtml(content);
		const sanitizedExcerpt = excerpt ? sanitizeText(excerpt) : null;

		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		// Process tags - find or create each tag
		const tagObjects = [];
		if (tags && Array.isArray(tags)) {
			for (const tagName of tags) {
				if (tagName.trim()) {
					const tag = await db.findOrCreateTag(tagName.trim());
					tagObjects.push(tag);
				}
			}
		}

		// Create post with validated and sanitized data
		const post = await db.createPost({
			title: sanitizedTitle,
			content: sanitizedContent,
			excerpt: sanitizedExcerpt,
			published: Boolean(published),
			publishedAt: published ? new Date() : null,
			slug,
			tags: tagObjects,
			authorId: user.id,
		});

		// Send email notifications if post is published
		if (published && post.publishedAt) {
			try {
				const { getSiteSettings } = await import('@/lib/settings');
				const settings = await getSiteSettings();
				const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
				const siteName = settings.siteName || "Kylee's Blog";
				const postUrl = `${siteUrl}/posts/${post.slug}`;

				// Send notifications asynchronously (don't wait for it)
				const { sendNewPostNotifications } = await import('@/lib/utils/email');
				sendNewPostNotifications(
					post.title,
					post.excerpt || null,
					postUrl,
					siteName
				).catch((error) => {
					// Log error but don't fail the request
					if (process.env.NODE_ENV === 'development') {
						console.error('Failed to send post notifications:', error);
					}
				});
			} catch (error) {
				// Don't fail the request if notification sending fails
				if (process.env.NODE_ENV === 'development') {
					console.error('Error setting up post notifications:', error);
				}
			}
		}

		return NextResponse.json({
			message: 'Post created successfully',
			post,
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error creating post:', error);
		}
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

		const posts = await db.findPosts({
			includeAuthor: true,
			includeTags: true,
			sort: { field: 'createdAt', order: 'desc' },
		});

		const response: PostsResponse = { posts };
		return NextResponse.json(response);
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error fetching posts:', error);
		}
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
