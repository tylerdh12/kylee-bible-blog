import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import ProfileClient from './profile-client';
import { ProfileFormSkeleton } from '@/components/skeletons/admin-skeletons';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProfile(userId: string) {
	const userProfile = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			avatar: true,
			bio: true,
			website: true,
			createdAt: true,
			updatedAt: true,
			_count: {
				select: {
					posts: true,
					comments: true,
				},
			},
		},
	});

	if (!userProfile) {
		return null;
	}

	return {
		...userProfile,
		postsCount: userProfile._count.posts,
		commentsCount: userProfile._count.comments,
		createdAt: userProfile.createdAt.toISOString(),
		updatedAt: userProfile.updatedAt.toISOString(),
		role: userProfile.role || 'SUBSCRIBER', // Default to SUBSCRIBER if null
		avatar: userProfile.avatar ?? undefined,
		bio: userProfile.bio ?? undefined,
		website: userProfile.website ?? undefined,
	};
}

export default async function ProfilePage() {
	// Verify authentication and ADMIN role server-side
	const { error, user } = await requireAdmin();
	if (error || !user) {
		redirect('/admin');
	}

	// Fetch profile data server-side
	const profile = await getProfile(user.id);

	if (!profile) {
		redirect('/admin');
	}

	return (
		<Suspense fallback={<ProfileFormSkeleton />}>
			<ProfileClient initialProfile={profile} />
		</Suspense>
	);
}
