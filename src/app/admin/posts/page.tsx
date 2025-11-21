import { getAuthenticatedUser } from '@/lib/auth';
import { DatabaseService } from '@/lib/services/database';
import { redirect } from 'next/navigation';
import PostsListClient from './posts-list-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PostsIndexPage() {
	// Verify authentication server-side
	const user = await getAuthenticatedUser();
	if (!user) {
		redirect('/admin');
	}

	// Fetch posts directly from database
	const db = DatabaseService.getInstance();
	const posts = await db.findPosts({
		includeAuthor: true,
		includeTags: true,
		sort: { field: 'createdAt', order: 'desc' },
	});

	// Convert to plain objects for client component
	const serializedPosts = posts.map((post) => ({
		id: post.id,
		title: post.title,
		slug: post.slug,
		content: post.content || '',
		excerpt: post.excerpt || undefined,
		published: post.published,
		publishedAt: post.publishedAt?.toISOString() || undefined,
		createdAt: post.createdAt.toISOString(),
		updatedAt: post.updatedAt.toISOString(),
		author: post.author ? {
			name: post.author.name || undefined,
			email: post.author.email,
		} : undefined,
		tags: post.tags?.map((tag) => ({ name: tag.name })) || [],
	}));

	return <PostsListClient initialPosts={serializedPosts} />;
}
