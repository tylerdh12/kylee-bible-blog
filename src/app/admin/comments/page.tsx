import { Suspense } from 'react';
import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import CommentsListClient from './comments-list-client';
import { CommentsListSkeleton } from '@/components/skeletons/admin-skeletons';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getComments() {
	const page = 1;
	const limit = 20;
	const skip = (page - 1) * limit;

	const [comments, total] = await Promise.all([
		prisma.comment.findMany({
			include: {
				author: {
					select: {
						id: true,
						name: true,
						email: true,
						avatar: true,
						role: true,
					},
				},
				post: {
					select: {
						id: true,
						title: true,
						slug: true,
					},
				},
				parent: {
					select: {
						id: true,
						content: true,
						author: {
							select: {
								name: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
			skip,
			take: limit,
		}),
		prisma.comment.count(),
	]);

	// Serialize dates and normalize null to undefined for avatar
	// Filter out comments without authors (shouldn't happen, but handle gracefully)
	const serializedComments = comments
		.filter((comment) => comment.author !== null)
		.map((comment) => ({
			...comment,
			createdAt: comment.createdAt.toISOString(),
			updatedAt: comment.updatedAt.toISOString(),
			author: {
				...comment.author!,
				avatar: comment.author!.avatar ?? undefined,
				role: comment.author!.role || 'SUBSCRIBER', // Default to SUBSCRIBER if null
			},
			parent: comment.parent && comment.parent.author ? {
				id: comment.parent.id,
				content: comment.parent.content,
				author: {
					name: comment.parent.author.name,
				},
			} : undefined,
		}));

	return {
		comments: serializedComments,
		totalPages: Math.ceil(total / limit),
	};
}

export default async function CommentsPage() {
	// Verify authentication and ADMIN role server-side
	const { error } = await requireAdmin();
	if (error) {
		redirect('/admin');
	}

	const { comments, totalPages } = await getComments();

	return (
		<Suspense fallback={<CommentsListSkeleton />}>
			<CommentsListClient 
				initialComments={comments} 
				initialTotalPages={totalPages}
			/>
		</Suspense>
	);
}
