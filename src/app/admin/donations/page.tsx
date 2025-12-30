import { Suspense } from 'react';
import { requireAdmin } from '@/lib/rbac';
import { DatabaseService } from '@/lib/services/database';
import { redirect } from 'next/navigation';
import DonationsListClient from './donations-list-client';
import { DonationsListSkeleton } from '@/components/skeletons/donations-skeleton';
import type { Donation } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getDonations(): Promise<Donation[]> {
	const db = DatabaseService.getInstance();
	const donations = await db.findDonations({
		includeGoal: true,
		sort: { field: 'createdAt', order: 'desc' },
	});
	
	// Serialize dates
	return donations.map((donation) => ({
		...donation,
		createdAt: typeof donation.createdAt === 'string' ? donation.createdAt : donation.createdAt.toISOString(),
	}));
}

export default async function DonationsPage() {
	// Verify authentication and ADMIN role server-side
	const { error } = await requireAdmin();
	if (error) {
		redirect('/admin');
	}

	const donations = await getDonations();

	return (
		<Suspense fallback={<DonationsListSkeleton />}>
			<DonationsListClient donations={donations} />
		</Suspense>
	);
}
