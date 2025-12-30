import { requireAdmin } from '@/lib/rbac';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import EditPostClient from './edit-post-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EditPostPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
	// Verify authentication and ADMIN role server-side
	const { error, user } = await requireAdmin();
	if (error || !user) {
		redirect('/admin');
	}

	// Get the post ID from params
	const { id } = await params;

	// Fetch post directly from database using Prisma
	const post = await prisma.post.findUnique({
		where: { id },
		include: {
			author: true,
			tags: true,
		},
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
