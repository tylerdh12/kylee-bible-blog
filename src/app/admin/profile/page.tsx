'use client';

import { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function ProfilePage() {
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
				{ label: 'Profile' },
			]}
			title='Profile'
			description='Manage your admin profile'
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
						<CardTitle>{user?.name || 'Admin'}</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-muted-foreground'>
							Email: {user?.email || 'admin'}
						</p>
					</CardContent>
				</Card>
			)}
		</DashboardLayout>
	);
}
