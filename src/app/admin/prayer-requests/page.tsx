import { Suspense } from 'react';
import { requireAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import PrayerRequestsListClient from './prayer-requests-list-client';
import { PrayerRequestsListSkeleton } from '@/components/skeletons/admin-skeletons';
import type { PrayerRequest } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPrayerRequests(): Promise<PrayerRequest[]> {
	const prayerRequests = await prisma.prayerRequest.findMany({
		orderBy: { createdAt: 'desc' },
		take: 50, // Limit to 50 most recent
	});
	
	// Serialize dates
	return prayerRequests.map((request) => ({
		...request,
		createdAt: request.createdAt.toISOString(),
	}));
}

export default async function PrayerRequestsPage() {
	// Verify authentication and ADMIN role server-side
	const { error } = await requireAdmin();
	if (error) {
		redirect('/admin');
	}

	const prayerRequests = await getPrayerRequests();

	return (
		<Suspense fallback={<PrayerRequestsListSkeleton />}>
			<PrayerRequestsListClient initialPrayerRequests={prayerRequests} />
		</Suspense>
	);
}
