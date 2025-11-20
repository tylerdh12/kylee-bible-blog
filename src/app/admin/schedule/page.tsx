'use client';

import { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Calendar,
	Clock,
	Edit,
	Eye,
	Plus,
	FileText,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import Link from 'next/link';

interface ScheduledPost {
	id: string;
	title: string;
	slug: string;
	publishedAt?: string;
	published: boolean;
	excerpt?: string;
}

export default function SchedulePage() {
	const [posts, setPosts] = useState<ScheduledPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentMonth, setCurrentMonth] = useState(new Date());

	useEffect(() => {
		fetchPosts();
	}, []);

	const fetchPosts = async () => {
		try {
			const response = await fetch('/api/posts');
			if (response.ok) {
				const data = await response.json();
				setPosts(data.posts || []);
			}
		} catch (error) {
			console.error('Error fetching posts:', error);
		} finally {
			setLoading(false);
		}
	};

	const monthStart = startOfMonth(currentMonth);
	const monthEnd = endOfMonth(currentMonth);
	const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

	const getPostsForDay = (day: Date) => {
		return posts.filter((post) => {
			if (!post.publishedAt) return false;
			return isSameDay(new Date(post.publishedAt), day);
		});
	};

	const upcomingPosts = posts
		.filter((post) => {
			if (!post.publishedAt) return false;
			const publishDate = new Date(post.publishedAt);
			return publishDate > new Date() && post.published;
		})
		.sort((a, b) => {
			if (!a.publishedAt || !b.publishedAt) return 0;
			return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
		})
		.slice(0, 5);

	const draftPosts = posts.filter((post) => !post.published);

	if (loading) {
		return (
			<div className='text-center py-8'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
				<p className='text-muted-foreground'>Loading schedule...</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Content Schedule
					</h1>
					<p className='text-muted-foreground'>
						View and manage your publishing calendar
					</p>
				</div>
				<Button asChild>
					<Link href='/admin/posts/new'>
						<Plus className='h-4 w-4 mr-2' />
						New Post
					</Link>
				</Button>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Calendar */}
				<Card className='lg:col-span-2'>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<CardTitle className='flex items-center gap-2'>
								<Calendar className='h-5 w-5' />
								{format(currentMonth, 'MMMM yyyy')}
							</CardTitle>
							<div className='flex gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
								>
									Previous
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={() => setCurrentMonth(new Date())}
								>
									Today
								</Button>
								<Button
									variant='outline'
									size='sm'
									onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
								>
									Next
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-7 gap-2'>
							{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
								<div
									key={day}
									className='text-center text-sm font-semibold text-muted-foreground py-2'
								>
									{day}
								</div>
							))}
							{/* Empty cells for days before month starts */}
							{Array.from({ length: monthStart.getDay() }).map((_, i) => (
								<div key={`empty-${i}`} className='aspect-square' />
							))}
							{/* Calendar days */}
							{daysInMonth.map((day) => {
								const dayPosts = getPostsForDay(day);
								const isToday = isSameDay(day, new Date());
								return (
									<div
										key={day.toISOString()}
										className={`aspect-square border rounded-md p-1 ${
											isToday ? 'border-primary bg-primary/5' : 'border-border'
										}`}
									>
										<div className='text-xs font-medium mb-1'>
											{format(day, 'd')}
										</div>
										{dayPosts.length > 0 && (
											<div className='space-y-1'>
												{dayPosts.slice(0, 2).map((post) => (
													<div
														key={post.id}
														className='text-[10px] bg-primary/10 text-primary rounded px-1 py-0.5 truncate'
														title={post.title}
													>
														{post.title}
													</div>
												))}
												{dayPosts.length > 2 && (
													<div className='text-[10px] text-muted-foreground'>
														+{dayPosts.length - 2} more
													</div>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Sidebar */}
				<div className='space-y-6'>
					{/* Upcoming Posts */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-base'>
								<Clock className='h-4 w-4' />
								Upcoming Posts
							</CardTitle>
							<CardDescription>
								Posts scheduled for publication
							</CardDescription>
						</CardHeader>
						<CardContent>
							{upcomingPosts.length === 0 ? (
								<p className='text-sm text-muted-foreground text-center py-4'>
									No upcoming posts scheduled
								</p>
							) : (
								<div className='space-y-3'>
									{upcomingPosts.map((post) => (
										<div
											key={post.id}
											className='border rounded-lg p-3 space-y-1'
										>
											<h4 className='text-sm font-semibold line-clamp-1'>
												{post.title}
											</h4>
											<p className='text-xs text-muted-foreground'>
												{post.publishedAt &&
													format(
														new Date(post.publishedAt),
														'MMM dd, yyyy h:mm a'
													)}
											</p>
											<div className='flex gap-1'>
												<Button
													asChild
													variant='ghost'
													size='sm'
													className='h-7 text-xs'
												>
													<Link href={`/admin/posts/${post.id}/edit`}>
														<Edit className='h-3 w-3 mr-1' />
														Edit
													</Link>
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Draft Posts */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-base'>
								<FileText className='h-4 w-4' />
								Drafts
							</CardTitle>
							<CardDescription>
								Unpublished posts
							</CardDescription>
						</CardHeader>
						<CardContent>
							{draftPosts.length === 0 ? (
								<p className='text-sm text-muted-foreground text-center py-4'>
									No drafts available
								</p>
							) : (
								<div className='space-y-3'>
									{draftPosts.slice(0, 5).map((post) => (
										<div
											key={post.id}
											className='border rounded-lg p-3 space-y-1'
										>
											<div className='flex items-start justify-between gap-2'>
												<h4 className='text-sm font-semibold line-clamp-1 flex-1'>
													{post.title}
												</h4>
												<Badge variant='secondary' className='text-xs'>
													Draft
												</Badge>
											</div>
											<div className='flex gap-1'>
												<Button
													asChild
													variant='ghost'
													size='sm'
													className='h-7 text-xs'
												>
													<Link href={`/admin/posts/${post.id}/edit`}>
														<Edit className='h-3 w-3 mr-1' />
														Edit
													</Link>
												</Button>
											</div>
										</div>
									))}
									{draftPosts.length > 5 && (
										<Button
											asChild
											variant='outline'
											size='sm'
											className='w-full'
										>
											<Link href='/admin/posts'>
												View All Drafts
											</Link>
										</Button>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
