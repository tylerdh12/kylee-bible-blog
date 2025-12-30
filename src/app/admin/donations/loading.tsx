import { DonationsListSkeleton } from '@/components/skeletons/donations-skeleton';

// Content-only skeleton - layout (sidebar/header) remains visible
export default function AdminDonationsLoading() {
	return <DonationsListSkeleton />;
}