'use client';

import { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { stripHtmlToText } from '@/lib/utils/sanitize';
import type { Post } from '@/types';

export function PostsContent() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadPosts() {
			try {
				setLoading(true);
				setError(null);

				// Load posts from API endpoint with timeout
				const controller = new AbortController();
				const timeoutId = setTimeout(
					() => controller.abort(),
					8000
				); // 8 second timeout

				try {
					const response = await fetch(
						'/api/public/posts',
						{
							signal: controller.signal,
							cache: 'no-store',
						}
					);

					clearTimeout(timeoutId);

					if (response.ok) {
						const data = await response.json();
						setPosts(data.posts || []);
					} else {
						console.log(
							'Posts API not available, using fallback'
						);
						setPosts([]);
					}
				} catch (err) {
					if (
						err instanceof Error &&
						err.name === 'AbortError'
					) {
						console.log(
							'Request timed out, using fallback content'
						);
					} else {
						console.log(
							'API request failed, using fallback content'
						);
					}
					setPosts([]);
				}
			} catch (err) {
				console.error('Failed to load posts:', err);
				setError('Unable to load posts');
				setPosts([]);
			} finally {
				setLoading(false);
			}
		}

		loadPosts();
	}, []);

	if (loading) {
		return (
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Card
						key={i}
						className='animate-pulse'
					>
						<CardHeader>
							<div className='h-6 bg-muted rounded w-3/4'></div>
							<div className='h-4 bg-muted rounded w-1/2'></div>
						</CardHeader>
						<CardContent>
							<div className='space-y-3'>
								<div className='h-4 bg-muted rounded'></div>
								<div className='h-4 bg-muted rounded w-5/6'></div>
								<div className='h-4 bg-muted rounded w-4/6'></div>
								<div className='flex gap-2 mt-4'>
									<div className='h-6 bg-muted rounded w-16'></div>
									<div className='h-6 bg-muted rounded w-20'></div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<Card>
				<CardContent className='py-12 text-center'>
					<h3 className='text-xl font-semibold mb-4'>
						No Posts Yet
					</h3>
					<p className='text-muted-foreground mb-4'>
						Welcome to Kylee's Bible Blog! Posts are being
						prepared and will be available soon.
					</p>
					<p className='text-sm text-muted-foreground'>
						Check back soon for inspiring Bible studies and
						spiritual insights, or visit the admin panel to
						create your first post.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{posts.map((post) => (
				<Card
					key={post.id}
					className='hover:shadow-lg transition-shadow'
				>
					<CardHeader>
						<CardTitle className='line-clamp-2'>
							{post.title}
						</CardTitle>
						<CardDescription>
							{post.publishedAt &&
								format(new Date(post.publishedAt), 'PPP')}
							{post.author && ` • By ${post.author.name}`}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className='text-muted-foreground mb-4 line-clamp-3'>
							{post.excerpt
								? stripHtmlToText(post.excerpt, 150)
								: stripHtmlToText(post.content, 150)}
						</p>
						{post.tags && post.tags.length > 0 && (
							<div className='flex flex-wrap gap-2 mb-4'>
								{post.tags.map((tag) => (
									<Badge
										key={tag.id}
										variant='secondary'
									>
										{tag.name}
									</Badge>
								))}
							</div>
						)}
						<Link
							href={`/posts/${post.slug}`}
							className='text-primary hover:underline font-medium'
						>
							Read more →
						</Link>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
