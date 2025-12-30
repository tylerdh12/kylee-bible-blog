import { Suspense } from 'react';
import { requireAdmin } from '@/lib/rbac';
import { DatabaseService } from '@/lib/services/database';
import { redirect } from 'next/navigation';
import GoalsListClient from './goals-list-client';
import { GoalsListSkeleton } from '@/components/skeletons/admin-skeletons';
import type { Goal } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getGoals(): Promise<Goal[]> {
	const db = DatabaseService.getInstance();
	const goals = await db.findGoals({
		includeDonations: true,
		sort: { field: 'createdAt', order: 'desc' },
	});
	
	// Serialize dates and ensure donations array exists
	return goals.map((goal) => ({
		...goal,
		createdAt: typeof goal.createdAt === 'string' ? goal.createdAt : goal.createdAt.toISOString(),
		updatedAt: typeof goal.updatedAt === 'string' ? goal.updatedAt : goal.updatedAt.toISOString(),
		deadline: goal.deadline ? (typeof goal.deadline === 'string' ? goal.deadline : goal.deadline.toISOString()) : null,
		donations: goal.donations || [],
	}));
}

export default async function GoalsPage() {
	// Verify authentication and ADMIN role server-side
	const { error } = await requireAdmin();
	if (error) {
		redirect('/admin');
	}

	const goals = await getGoals();

	return (
		<Suspense fallback={<GoalsListSkeleton />}>
			<GoalsListClient goals={goals} />
		</Suspense>
	);
}
