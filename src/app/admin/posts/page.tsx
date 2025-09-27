'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Plus, Edit, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function PostsIndexPage() {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [posts, setPosts] = useState<
		Array<{
			id: string;
			title: string;
			slug: string;
			excerpt?: string;
			published: boolean;
			publishedAt?: string;
			createdAt: string;
			updatedAt: string;
			author?: { name?: string; email: string };
			tags?: Array<{ name: string }>;
		}>
	>([]);

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

	useEffect(() => {
		if (user) {
			fetchPosts();
		}
	}, [user]);

	const fetchPosts = async () => {
		try {
			const res = await fetch('/api/posts');
			if (res.ok) {
				const data = await res.json();
				setPosts(data.posts || []);
			}
		} catch (err) {
			console.error('Failed to load posts', err);
		}
	};

	if (loading) {
		return (
			<DashboardLayout
				user={user}
				breadcrumbs={[
					{ label: 'Dashboard', href: '/admin' },
					{ label: 'Posts' },
				]}
				title='Posts'
				description='Manage your blog posts'
			>
				<div className='text-center py-8'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
					<p className='text-muted-foreground'>
						Loading posts...
					</p>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout
			user={user}
			breadcrumbs={[
				{ label: 'Dashboard', href: '/admin' },
				{ label: 'Posts' },
			]}
			title='Posts'
			description='Create and manage your posts'
		>
			<div className='flex justify-between items-center mb-6'>
				<div className='flex items-center gap-2'>
					<span className='text-sm text-muted-foreground'>
						Posts overview
					</span>
				</div>
				<Button asChild>
					<Link href='/admin/posts/new'>New Post</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Posts</CardTitle>
				</CardHeader>
				<CardContent>
					{posts.length === 0 ? (
						<div className='text-center py-12'>
							<div className='mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4'>
								📝
							</div>
							<h3 className='text-lg font-semibold mb-2'>
								No posts yet
							</h3>
							<p className='text-muted-foreground mb-4'>
								Create your first blog post to get started.
							</p>
							<Button asChild>
								<Link href='/admin/posts/new'>
									<Plus className='h-4 w-4 mr-2' />
									Create Your First Post
								</Link>
							</Button>
						</div>
					) : (
						<div className='space-y-4'>
							{posts.map((post) => (
								<div
									key={post.id}
									className='border rounded-lg p-4 hover:shadow-md transition-shadow'
								>
									<div className='flex justify-between items-start mb-3'>
										<div className='flex-1'>
											<h3 className='font-semibold text-lg mb-1'>
												{post.title}
											</h3>
											{post.excerpt && (
												<p className='text-sm text-muted-foreground mb-2 line-clamp-2'>
													{post.excerpt}
												</p>
											)}
											<div className='flex items-center gap-4 text-xs text-muted-foreground'>
												<div className='flex items-center gap-1'>
													<Calendar className='h-3 w-3' />
													<span>
														{post.published &&
														post.publishedAt
															? `Published ${format(
																	new Date(
																		post.publishedAt
																	),
																	'MMM dd, yyyy'
															  )}`
															: `Created ${format(
																	new Date(post.createdAt),
																	'MMM dd, yyyy'
															  )}`}
													</span>
												</div>
												{post.author && (
													<span>
														By{' '}
														{post.author.name ||
															post.author.email}
													</span>
												)}
											</div>
										</div>
										<div className='flex items-center gap-2 ml-4'>
											<Badge
												variant={
													post.published
														? 'default'
														: 'secondary'
												}
											>
												{post.published
													? 'Published'
													: 'Draft'}
											</Badge>
										</div>
									</div>

									{post.tags && post.tags.length > 0 && (
										<div className='flex flex-wrap gap-1 mb-3'>
											{post.tags.map((tag, index) => (
												<Badge
													key={index}
													variant='outline'
													className='text-xs'
												>
													{tag.name}
												</Badge>
											))}
										</div>
									)}

									<div className='flex items-center gap-2'>
										<Button
											asChild
											variant='outline'
											size='sm'
										>
											<Link
												href={`/admin/posts/${post.id}/edit`}
											>
												<Edit className='h-3 w-3 mr-1' />
												Edit
											</Link>
										</Button>
										{post.published && (
											<Button
												asChild
												variant='outline'
												size='sm'
											>
												<Link
													href={`/posts/${post.slug}`}
													target='_blank'
												>
													<Eye className='h-3 w-3 mr-1' />
													View
												</Link>
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</DashboardLayout>
	);
}
