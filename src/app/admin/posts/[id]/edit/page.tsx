import { getAuthenticatedUser } from '@/lib/auth';
import { DatabaseService } from '@/lib/services/database';
import { redirect, notFound } from 'next/navigation';
import EditPostClient from './edit-post-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EditPostPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
	// Verify authentication server-side
	const user = await getAuthenticatedUser();
	if (!user) {
		redirect('/admin');
	}

	// Get the post ID from params
	const { id } = await params;

	// Fetch post directly from database
	const db = DatabaseService.getInstance();
	const post = await db.findPostById(id, {
		includeAuthor: true,
		includeTags: true,
	});

	if (!post) {
		notFound();
	}

	// Convert to plain object for client component
	const serializedPost = {
		id: post.id,
		title: post.title,
		slug: post.slug,
		content: post.content || '',
		excerpt: post.excerpt || '',
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
	};

	return <EditPostClient post={serializedPost} />;
}
