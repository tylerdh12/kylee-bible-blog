import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { DatabaseService } from '@/lib/services/database';

const db = DatabaseService.getInstance();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
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
		console.error('Error fetching post:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
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

		const updateData: any = {
			title: title.trim(),
			content: content.trim(),
			excerpt: excerpt?.trim() || null,
			published: Boolean(published),
			slug,
			tags: tagObjects,
		};

		// Only set publishedAt if we're publishing for the first time
		if (published) {
			updateData.publishedAt = new Date();
		}

		const post = await db.updatePost(id, updateData);

		if (!post) {
			return NextResponse.json(
				{ error: 'Post not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: 'Post updated successfully',
			post,
		});
	} catch (error) {
		console.error('Error updating post:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
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
		console.error('Error deleting post:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}