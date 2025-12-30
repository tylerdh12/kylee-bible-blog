import { PageSkeleton } from '@/components/skeletons/admin-skeletons';

// This loading file is for the admin route segment
// It only shows content skeleton - the layout (sidebar/header) remains visible
export default function AdminLoading() {
	return <PageSkeleton />;
}