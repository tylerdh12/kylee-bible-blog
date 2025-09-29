'use client';

import { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard-layout';
import { PrayerRequest } from '@/types';
import { Heart, Eye, EyeOff, Trash2 } from 'lucide-react';

export default function PrayerRequestsPage() {
	const [prayerRequests, setPrayerRequests] = useState<
		PrayerRequest[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		checkAuth();
	}, []);

	useEffect(() => {
		if (user) {
			fetchPrayerRequests();
		}
	}, [user]);

	const checkAuth = async () => {
		try {
			const response = await fetch('/api/auth/status');
			const data = await response.json();
			if (data.authenticated) {
				setUser(data.user);
			} else {
				window.location.href = '/admin';
			}
		} catch {
			window.location.href = '/admin';
		}
	};

	const fetchPrayerRequests = async () => {
		try {
			const response = await fetch(
				'/api/admin/prayer-requests'
			);
			if (response.ok) {
				const data = await response.json();
				setPrayerRequests(data.prayerRequests || []);
			}
		} catch (error) {
			console.error(
				'Error fetching prayer requests:',
				error
			);
		} finally {
			setLoading(false);
		}
	};

	const markAsRead = async (
		id: string,
		isRead: boolean
	) => {
		try {
			const response = await fetch(
				`/api/admin/prayer-requests/${id}`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ isRead }),
				}
			);

			if (response.ok) {
				setPrayerRequests((prev) =>
					prev.map((request) =>
						request.id === id
							? { ...request, isRead }
							: request
					)
				);
			}
		} catch (error) {
			console.error(
				'Error updating prayer request:',
				error
			);
		}
	};

	const deletePrayerRequest = async (id: string) => {
		if (
			!confirm(
				'Are you sure you want to delete this prayer request?'
			)
		) {
			return;
		}

		try {
			const response = await fetch(
				`/api/admin/prayer-requests/${id}`,
				{
					method: 'DELETE',
				}
			);

			if (response.ok) {
				setPrayerRequests((prev) =>
					prev.filter((request) => request.id !== id)
				);
			}
		} catch (error) {
			console.error(
				'Error deleting prayer request:',
				error
			);
		}
	};

	const unreadCount = prayerRequests.filter(
		(req) => !req.isRead
	).length;

	if (loading) {
		return (
			<DashboardLayout>
				<div className='space-y-6'>
					<div className='flex justify-between items-center'>
						<h1 className='text-3xl font-bold'>
							Prayer Requests
						</h1>
					</div>
					<div className='grid gap-4'>
						{[1, 2, 3].map((i) => (
							<Card
								key={i}
								className='animate-pulse'
							>
								<CardContent className='p-6'>
									<div className='space-y-3'>
										<div className='h-4 bg-muted rounded w-1/4'></div>
										<div className='h-4 bg-muted rounded w-3/4'></div>
										<div className='h-4 bg-muted rounded w-1/2'></div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className='space-y-6'>
				<div className='flex justify-between items-center'>
					<div>
						<h1 className='text-3xl font-bold'>
							Prayer Requests
						</h1>
						<p className='text-muted-foreground'>
							{unreadCount} unread request
							{unreadCount !== 1 ? 's' : ''}
						</p>
					</div>
				</div>

				{prayerRequests.length === 0 ? (
					<Card>
						<CardContent className='py-12 text-center'>
							<Heart className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
							<h3 className='text-xl font-semibold mb-2'>
								No Prayer Requests Yet
							</h3>
							<p className='text-muted-foreground'>
								When people submit prayer requests, they
								will appear here for you to review and pray
								over.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className='space-y-4'>
						{prayerRequests.map((request) => (
							<Card
								key={request.id}
								className={`${
									!request.isRead
										? 'border-l-4 border-l-blue-500'
										: ''
								}`}
							>
								<CardHeader>
									<div className='flex justify-between items-start'>
										<div className='space-y-1'>
											<div className='flex items-center gap-2'>
												<CardTitle className='text-lg'>
													{request.name || 'Anonymous'}
												</CardTitle>
												{!request.isRead && (
													<Badge variant='default'>
														New
													</Badge>
												)}
												{request.isPrivate && (
													<Badge variant='secondary'>
														Private
													</Badge>
												)}
											</div>
											{request.email && (
												<p className='text-sm text-muted-foreground'>
													{request.email}
												</p>
											)}
											<p className='text-sm text-muted-foreground'>
												{format(
													new Date(request.createdAt),
													'PPPp'
												)}
											</p>
										</div>
										<div className='flex gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													markAsRead(
														request.id,
														!request.isRead
													)
												}
											>
												{request.isRead ? (
													<EyeOff className='h-4 w-4' />
												) : (
													<Eye className='h-4 w-4' />
												)}
												<span className='ml-2'>
													{request.isRead
														? 'Mark Unread'
														: 'Mark Read'}
												</span>
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													deletePrayerRequest(request.id)
												}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className='bg-muted/50 rounded-lg p-4'>
										<p className='whitespace-pre-wrap'>
											{request.request}
										</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
