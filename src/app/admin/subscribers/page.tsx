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
		<>
			{loading ? (
				<div className='py-8 text-center'>
					<div className='mx-auto mb-4 w-12 h-12 rounded-full border-b-2 animate-spin border-primary'></div>
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
		</>
	);
}
