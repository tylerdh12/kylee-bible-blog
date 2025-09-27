import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { DatabaseService } from '@/lib/services/database';
import type { PostsResponse, ApiResponse } from '@/types';

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

		// Create post with validated data
		const post = await db.createPost({
			title: title.trim(),
			content: content.trim(),
			excerpt: excerpt?.trim() || null,
			published: Boolean(published),
			publishedAt: published ? new Date() : null,
			slug,
			tags: tagObjects,
			authorId: user.id,
		});


		return NextResponse.json({
			message: 'Post created successfully',
			post,
		});
	} catch (error) {
		console.error('Error creating post:', error);
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
		console.error('Error fetching posts:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
