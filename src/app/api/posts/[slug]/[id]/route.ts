import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-new';
import { DatabaseService } from '@/lib/services/database';
import { sanitizeHtml, sanitizeText } from '@/lib/utils/sanitize';

const db = DatabaseService.getInstance();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string; id: string }> }
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
		// For admin, we can get unpublished posts too
		const posts = await db.findPosts({
			includeAuthor: true,
			includeTags: true,
		});

		const post = posts.find(p => p.id === id);

		if (!post) {
			return NextResponse.json(
				{ error: 'Post not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ post });
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error fetching post:', error);
		}
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string; id: string }> }
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
		const { title, content, excerpt, published, tags } = await request.json();

		if (!title?.trim() || !content?.trim()) {
			return NextResponse.json(
				{ error: 'Title and content are required' },
				{ status: 400 }
			);
		}

		// Sanitize inputs to prevent XSS (async on server)
		const sanitizedTitle = await sanitizeText(title);
		const sanitizedContent = await sanitizeHtml(content);
		const sanitizedExcerpt = excerpt ? await sanitizeText(excerpt) : null;

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

		// Get existing post to check if it was already published
		const { prisma } = await import('@/lib/db');
		const existingPost = await prisma.post.findUnique({
			where: { id },
			select: { published: true, publishedAt: true },
		});
		const wasAlreadyPublished = existingPost?.published && existingPost?.publishedAt;

		const updateData: any = {
			title: sanitizedTitle,
			content: sanitizedContent,
			excerpt: sanitizedExcerpt,
			published: Boolean(published),
			slug,
			tags: tagObjects,
		};

		// Only set publishedAt if we're publishing for the first time
		const isBeingPublishedNow = published && !wasAlreadyPublished;
		if (isBeingPublishedNow) {
			updateData.publishedAt = new Date();
		}

		const post = await db.updatePost(id, updateData);

		if (!post) {
			return NextResponse.json(
				{ error: 'Post not found' },
				{ status: 404 }
			);
		}

		// Send email notifications if post is being published for the first time
		if (isBeingPublishedNow && post.publishedAt) {
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
			message: 'Post updated successfully',
			post,
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error updating post:', error);
		}
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string; id: string }> }
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
		const success = await db.deletePost(id);

		if (!success) {
			return NextResponse.json(
				{ error: 'Post not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: 'Post deleted successfully',
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error deleting post:', error);
		}
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}