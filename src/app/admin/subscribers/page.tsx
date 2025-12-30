import { Suspense } from 'react';
import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import SubscribersListClient from './subscribers-list-client';
import { SubscribersListSkeleton } from '@/components/skeletons/subscribers-skeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSubscribers() {
	const subscribers = await prisma.subscriber.findMany({
		orderBy: { subscribedAt: 'desc' },
	});

	return subscribers.map(sub => ({
		id: sub.id,
		email: sub.email,
		name: sub.name || undefined,
		status: sub.status,
		subscribedAt: sub.subscribedAt.toISOString(),
		lastEmailSent: sub.lastEmailSent?.toISOString(),
		tags: sub.tags ? JSON.parse(sub.tags as string) : [],
	}));
}

export default async function SubscribersPage() {
	// Verify authentication and ADMIN role server-side
	const { error } = await requireAdmin();
	if (error) {
		redirect('/admin');
	}

	const subscribers = await getSubscribers();

	return (
		<Suspense fallback={<SubscribersListSkeleton />}>
			<SubscribersListClient initialSubscribers={subscribers} />
		</Suspense>
	);
}
