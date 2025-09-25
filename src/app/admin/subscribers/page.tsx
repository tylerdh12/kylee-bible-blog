'use client';

import { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function SubscribersPage() {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await fetch('/api/auth/status');
				const data = await res.json();
				if (data.authenticated) {
					setUser(data.user);
				} else {
					window.location.href = '/admin';
				}
			} catch {
				window.location.href = '/admin';
			} finally {
				setLoading(false);
			}
		};
		checkAuth();
	}, []);

	return (
		<DashboardLayout
			user={user}
			breadcrumbs={[
				{ label: 'Dashboard', href: '/admin' },
				{ label: 'Subscribers' },
			]}
			title='Subscribers'
			description='Manage newsletter subscribers'
		>
			{loading ? (
				<div className='text-center py-8'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
					<p className='text-muted-foreground'>
						Loading...
					</p>
				</div>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Coming soon</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-muted-foreground'>
							Subscriber management UI will appear here.
						</p>
					</CardContent>
				</Card>
			)}
		</DashboardLayout>
	);
}
