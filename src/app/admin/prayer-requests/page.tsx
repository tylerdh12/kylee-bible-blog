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
			<>
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
										<div className='w-1/4 h-4 rounded bg-muted'></div>
										<div className='w-3/4 h-4 rounded bg-muted'></div>
										<div className='w-1/2 h-4 rounded bg-muted'></div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</>
		);
	}

	return (
		<>
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
							<Heart className='mx-auto mb-4 w-12 h-12 text-muted-foreground' />
							<h3 className='mb-2 text-xl font-semibold'>
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
											<div className='flex gap-2 items-center'>
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
													<EyeOff className='w-4 h-4' />
												) : (
													<Eye className='w-4 h-4' />
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
												<Trash2 className='w-4 h-4' />
											</Button>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className='p-4 rounded-lg bg-muted/50'>
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
		</>
	);
}
