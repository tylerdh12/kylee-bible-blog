'use client';

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { PrayerRequest } from '@/types';
import { Heart, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrayerRequestsListClientProps {
	initialPrayerRequests: PrayerRequest[];
}

export default function PrayerRequestsListClient({ initialPrayerRequests }: PrayerRequestsListClientProps) {
	const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(initialPrayerRequests);

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
				toast.success(isRead ? 'Marked as read' : 'Marked as unread');
			}
		} catch (error) {
			console.error(
				'Error updating prayer request:',
				error
			);
			toast.error('Failed to update prayer request');
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
				toast.success('Prayer request deleted');
			}
		} catch (error) {
			console.error(
				'Error deleting prayer request:',
				error
			);
			toast.error('Failed to delete prayer request');
		}
	};

	const unreadCount = prayerRequests.filter(
		(req) => !req.isRead
	).length;

	return (
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
				<div className='grid gap-4 md:grid-cols-2'>
					{prayerRequests.map((request) => (
						<Card
							key={request.id}
							className={request.isRead ? 'opacity-75' : ''}
						>
							<CardHeader>
								<div className='flex justify-between items-start'>
									<CardTitle className='text-lg'>
										{request.name || 'Anonymous'}
									</CardTitle>
									<div className='flex gap-2'>
										{request.isRead ? (
											<Badge variant='secondary'>
												Read
											</Badge>
										) : (
											<Badge variant='default'>
												New
											</Badge>
										)}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{request.email && (
										<p className='text-sm text-muted-foreground'>
											{request.email}
										</p>
									)}
									<p className='text-sm'>
										{request.request}
									</p>
									<div className='flex justify-between items-center'>
										<span className='text-xs text-muted-foreground'>
											{format(
												new Date(request.createdAt),
												'PPp'
											)}
										</span>
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
													<>
														<EyeOff className='mr-1 w-4 h-4' />
														Mark Unread
													</>
												) : (
													<>
														<Eye className='mr-1 w-4 h-4' />
														Mark Read
													</>
												)}
											</Button>
											<Button
												variant='destructive'
												size='sm'
												onClick={() =>
													deletePrayerRequest(
														request.id
													)
												}
											>
												<Trash2 className='w-4 h-4' />
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
