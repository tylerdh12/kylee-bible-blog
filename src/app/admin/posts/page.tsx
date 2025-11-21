'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Eye, Search, MoreVertical, Trash2, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Post {
	id: string;
	title: string;
	slug: string;
	content?: string;
	excerpt?: string;
	published: boolean;
	publishedAt?: string;
	createdAt: string;
	updatedAt: string;
	author?: { name?: string; email: string };
	tags?: Array<{ name: string }>;
}

export default function PostsIndexPage() {
	const [loading, setLoading] = useState(true);
	const [posts, setPosts] = useState<Post[]>([]);
	const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
	const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 10;

	useEffect(() => {
		fetchPosts();
	}, []);

	useEffect(() => {
		filterPosts();
	}, [posts, searchQuery, statusFilter]);

	const fetchPosts = async () => {
		try {
			const res = await fetch('/api/posts', {
				credentials: 'include',
			});
			if (res.ok) {
				const data = await res.json();
				setPosts(data.posts || []);
			} else {
				toast.error('Failed to load posts');
			}
		} catch (err) {
			console.error('Failed to load posts', err);
			toast.error('Failed to load posts');
		} finally {
			setLoading(false);
		}
	};

	const filterPosts = () => {
		let filtered = [...posts];

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(post) =>
					post.title.toLowerCase().includes(query) ||
					post.excerpt?.toLowerCase().includes(query) ||
					post.tags?.some((tag) => tag.name.toLowerCase().includes(query))
			);
		}

		// Apply status filter
		if (statusFilter !== 'all') {
			filtered = filtered.filter((post) =>
				statusFilter === 'published' ? post.published : !post.published
			);
		}

		setFilteredPosts(filtered);
		setCurrentPage(1); // Reset to first page when filters change
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			const allPostIds = new Set(paginatedPosts.map((post) => post.id));
			setSelectedPosts(allPostIds);
		} else {
			setSelectedPosts(new Set());
		}
	};

	const handleSelectPost = (postId: string, checked: boolean) => {
		const newSelected = new Set(selectedPosts);
		if (checked) {
			newSelected.add(postId);
		} else {
			newSelected.delete(postId);
		}
		setSelectedPosts(newSelected);
	};

	const handleBulkDelete = async () => {
		if (selectedPosts.size === 0) return;

		if (!confirm(`Are you sure you want to delete ${selectedPosts.size} post(s)? This action cannot be undone.`)) {
			return;
		}

		setLoading(true);
		let successCount = 0;
		let errorCount = 0;

		for (const postId of selectedPosts) {
			try {
				const post = posts.find((p) => p.id === postId);
				if (!post) continue;

				const slug = post.slug || post.title
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/(^-|-$)/g, '');

				const response = await fetch(`/api/posts/${slug}/${postId}`, {
					method: 'DELETE',
				});

				if (response.ok) {
					successCount++;
				} else {
					errorCount++;
				}
			} catch (error) {
				console.error('Error deleting post:', error);
				errorCount++;
			}
		}

		setSelectedPosts(new Set());
		setLoading(false);

		if (successCount > 0) {
			toast.success(`Successfully deleted ${successCount} post(s)`);
			fetchPosts();
		}
		if (errorCount > 0) {
			toast.error(`Failed to delete ${errorCount} post(s)`);
		}
	};

	const handleBulkPublish = async (publish: boolean) => {
		if (selectedPosts.size === 0) return;

		setLoading(true);
		let successCount = 0;
		let errorCount = 0;

		for (const postId of selectedPosts) {
			try {
				const post = posts.find((p) => p.id === postId);
				if (!post || !post.content) {
					errorCount++;
					continue;
				}

				const slug = post.slug || post.title
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/(^-|-$)/g, '');

				const response = await fetch(`/api/posts/${slug}/${postId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						title: post.title,
						content: post.content,
						excerpt: post.excerpt,
						published: publish,
						tags: post.tags?.map((t) => t.name) || [],
					}),
				});

				if (response.ok) {
					successCount++;
				} else {
					errorCount++;
				}
			} catch (error) {
				console.error('Error updating post:', error);
				errorCount++;
			}
		}

		setSelectedPosts(new Set());
		setLoading(false);

		if (successCount > 0) {
			toast.success(`Successfully ${publish ? 'published' : 'unpublished'} ${successCount} post(s)`);
			fetchPosts();
		}
		if (errorCount > 0) {
			toast.error(`Failed to update ${errorCount} post(s)`);
		}
	};

	// Pagination
	const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
	const startIndex = (currentPage - 1) * postsPerPage;
	const endIndex = startIndex + postsPerPage;
	const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

	if (loading) {
		return (
			<div className='text-center py-8'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
				<p className='text-muted-foreground'>Loading posts...</p>
			</div>
		);
	}

	return (
		<>
			<div className='flex justify-between items-center mb-6'>
				<div>
					<h1 className='text-3xl font-bold'>Posts</h1>
					<p className='text-muted-foreground mt-1'>
						Manage your blog posts and biblical insights
					</p>
				</div>
				<Button asChild>
					<Link href='/admin/posts/new'>
						<Plus className='h-4 w-4 mr-2' />
						New Post
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
						<CardTitle className='flex items-center gap-2'>
							<Filter className='h-5 w-5' />
							Filter & Search
						</CardTitle>
						{selectedPosts.size > 0 && (
							<div className='flex gap-2'>
								<Button
									size='sm'
									variant='outline'
									onClick={() => handleBulkPublish(true)}
									disabled={loading}
								>
									Publish Selected ({selectedPosts.size})
								</Button>
								<Button
									size='sm'
									variant='outline'
									onClick={() => handleBulkPublish(false)}
									disabled={loading}
								>
									Unpublish Selected
								</Button>
								<Button
									size='sm'
									variant='destructive'
									onClick={handleBulkDelete}
									disabled={loading}
								>
									<Trash2 className='h-4 w-4 mr-2' />
									Delete Selected
								</Button>
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col sm:flex-row gap-4 mb-6'>
						<div className='flex-1 relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search posts by title, excerpt, or tags...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10'
							/>
						</div>
						<Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
							<SelectTrigger className='w-full sm:w-[180px]'>
								<SelectValue placeholder='Filter by status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Posts</SelectItem>
								<SelectItem value='published'>Published</SelectItem>
								<SelectItem value='draft'>Drafts</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{filteredPosts.length === 0 ? (
						<div className='text-center py-12'>
							{posts.length === 0 ? (
								<>
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
								</>
							) : (
								<>
									<h3 className='text-lg font-semibold mb-2'>
										No posts found
									</h3>
									<p className='text-muted-foreground'>
										Try adjusting your search or filter criteria.
									</p>
								</>
							)}
						</div>
					) : (
						<>
							<div className='space-y-4'>
								{paginatedPosts.map((post) => (
									<div
										key={post.id}
										className='border rounded-lg p-4 hover:shadow-md transition-shadow'
									>
										<div className='flex items-start gap-4'>
											<Checkbox
												checked={selectedPosts.has(post.id)}
												onCheckedChange={(checked) =>
													handleSelectPost(post.id, checked as boolean)
												}
												className='mt-1'
											/>
											<div className='flex-1'>
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
										</div>
									</div>
								))}
							</div>

							{totalPages > 1 && (
								<div className='flex items-center justify-between mt-6 pt-4 border-t'>
									<p className='text-sm text-muted-foreground'>
										Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of{' '}
										{filteredPosts.length} posts
									</p>
									<div className='flex gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
											disabled={currentPage === 1}
										>
											Previous
										</Button>
										<div className='flex items-center gap-2'>
											{Array.from({ length: totalPages }, (_, i) => i + 1)
												.filter(
													(page) =>
														page === 1 ||
														page === totalPages ||
														(page >= currentPage - 1 && page <= currentPage + 1)
												)
												.map((page, index, array) => (
													<>
														{index > 0 && array[index - 1] !== page - 1 && (
															<span key={`ellipsis-${page}`}>...</span>
														)}
														<Button
															key={page}
															variant={currentPage === page ? 'default' : 'outline'}
															size='sm'
															onClick={() => setCurrentPage(page)}
														>
															{page}
														</Button>
													</>
												))}
										</div>
										<Button
											variant='outline'
											size='sm'
											onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
											disabled={currentPage === totalPages}
										>
											Next
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</>
	);
}
