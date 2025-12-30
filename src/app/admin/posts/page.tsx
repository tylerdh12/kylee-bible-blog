import { getAuthenticatedUser } from '@/lib/auth-new';
import { requireAdmin } from '@/lib/rbac';
import { DatabaseService } from '@/lib/services/database';
import { redirect } from 'next/navigation';
import PostsListClient from './posts-list-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PostsIndexPage() {
	// Verify authentication and ADMIN role server-side
	const { error, user } = await requireAdmin();
	if (error || !user) {
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
		publishedAt: post.publishedAt
			? (typeof post.publishedAt === 'string' ? post.publishedAt : post.publishedAt.toISOString())
			: undefined,
		createdAt: typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString(),
		updatedAt: typeof post.updatedAt === 'string' ? post.updatedAt : post.updatedAt.toISOString(),
		author: post.author ? {
			name: post.author.name || undefined,
			email: post.author.email,
		} : undefined,
		tags: post.tags?.map((tag) => ({ name: tag.name })) || [],
	}));

	return <PostsListClient initialPosts={serializedPosts} />;
}
