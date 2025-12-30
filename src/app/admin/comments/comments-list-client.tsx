'use client';

import { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/components/ui/avatar';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
	MessageCircle,
	Search,
	Check,
	X,
	Trash2,
	ExternalLink,
	Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { CommentsListSkeleton } from '@/components/skeletons/admin-skeletons';

interface Comment {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	author: {
		id: string;
		name: string;
		email: string;
		avatar?: string;
		role: string;
	};
	post: {
		id: string;
		title: string;
		slug: string;
	};
	parent?: {
		id: string;
		content: string;
		author: {
			name: string;
		};
	};
}

interface CommentsListClientProps {
	initialComments: Comment[];
	initialTotalPages: number;
}

export default function CommentsListClient({ 
	initialComments, 
	initialTotalPages 
}: CommentsListClientProps) {
	const [comments, setComments] = useState<Comment[]>(initialComments);
	const [searchQuery, setSearchQuery] = useState('');
	const [approvalFilter, setApprovalFilter] = useState<string>('all');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(initialTotalPages);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (page === 1 && approvalFilter === 'all') {
			// Use initial data, no need to fetch
			return;
		}
		fetchComments();
	}, [approvalFilter, page]);

	const fetchComments = async () => {
		setLoading(true);
		try {
			let url = `/api/admin/comments?page=${page}`;
			if (approvalFilter !== 'all') {
				url += `&approved=${approvalFilter}`;
			}

			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				setComments(data.comments || []);
				setTotalPages(data.pagination?.totalPages || 1);
			}
		} catch (error) {
			console.error('Error fetching comments:', error);
			toast.error('Failed to load comments');
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async (id: string, isApproved: boolean) => {
		try {
			const response = await fetch(`/api/admin/comments/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isApproved }),
			});

			if (response.ok) {
				toast.success(
					isApproved
						? 'Comment approved successfully'
						: 'Comment rejected successfully'
				);
				await fetchComments();
			} else {
				toast.error('Failed to update comment');
			}
		} catch (error) {
			console.error('Error updating comment:', error);
			toast.error('Failed to update comment');
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/admin/comments/${id}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success('Comment deleted successfully');
				await fetchComments();
			} else {
				toast.error('Failed to delete comment');
			}
		} catch (error) {
			console.error('Error deleting comment:', error);
			toast.error('Failed to delete comment');
		}
	};

	const filteredComments = comments.filter((comment) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			comment.content.toLowerCase().includes(query) ||
			comment.author.name?.toLowerCase().includes(query) ||
			comment.author.email.toLowerCase().includes(query) ||
			comment.post.title.toLowerCase().includes(query)
		);
	});

	const pendingCount = comments.filter((c) => !c.isApproved).length;
	const approvedCount = comments.filter((c) => c.isApproved).length;

	if (loading && page === 1) {
		return <CommentsListSkeleton />;
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Comments
					</h1>
					<p className='text-muted-foreground'>
						Moderate and manage blog comments
					</p>
				</div>
				<div className='flex gap-2'>
					<Badge variant='outline'>
						{pendingCount} pending
					</Badge>
					<Badge variant='default'>
						{approvedCount} approved
					</Badge>
				</div>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<div className='flex-1'>
							<div className='relative'>
								<Search className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' />
								<Input
									placeholder='Search comments, authors, or posts...'
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className='pl-10'
								/>
							</div>
						</div>
						<Select
							value={approvalFilter}
							onValueChange={(value) => {
								setApprovalFilter(value);
								setPage(1);
							}}
						>
							<SelectTrigger className='w-full sm:w-48'>
								<SelectValue placeholder='Filter by status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Comments</SelectItem>
								<SelectItem value='false'>
									Pending Approval
								</SelectItem>
								<SelectItem value='true'>Approved</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Comments List */}
			{filteredComments.length === 0 ? (
				<Card>
					<CardContent className='py-12 text-center'>
						<MessageCircle className='mx-auto mb-4 w-12 h-12 text-muted-foreground' />
						<h3 className='mb-2 text-xl font-semibold'>
							No Comments Found
						</h3>
						<p className='text-muted-foreground'>
							{searchQuery
								? 'Try adjusting your search or filters'
								: 'No comments have been submitted yet'}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className='space-y-4'>
					{filteredComments.map((comment) => (
						<Card key={comment.id}>
							<CardContent className='p-6'>
								<div className='flex gap-4'>
									<Avatar className='h-10 w-10'>
										<AvatarImage
											src={comment.author.avatar}
											alt={comment.author.name}
										/>
										<AvatarFallback>
											{comment.author.name
												?.charAt(0)
												.toUpperCase() ||
												comment.author.email.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className='flex-1 space-y-3'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center gap-2'>
												<span className='font-semibold'>
													{comment.author.name ||
														'Anonymous'}
												</span>
												<Badge
													variant={
														comment.isApproved
															? 'default'
															: 'outline'
													}
												>
													{comment.isApproved
														? 'Approved'
														: 'Pending'}
												</Badge>
											</div>
											<span className='text-sm text-muted-foreground'>
												{format(
													new Date(comment.createdAt),
													'PPp'
												)}
											</span>
										</div>
										<p className='text-sm'>{comment.content}</p>
										{comment.parent && (
											<div className='rounded-md bg-muted p-3 text-sm'>
												<p className='font-medium'>
													Replying to{' '}
													{comment.parent.author.name}:
												</p>
												<p className='mt-1 text-muted-foreground'>
													{comment.parent.content}
												</p>
											</div>
										)}
										<div className='flex items-center justify-between'>
											<Link
												href={`/posts/${comment.post.slug}`}
												target='_blank'
												className='flex items-center gap-1 text-sm text-primary hover:underline'
											>
												<ExternalLink className='w-3 h-3' />
												{comment.post.title}
											</Link>
											<div className='flex gap-2'>
												{!comment.isApproved ? (
													<Button
														variant='default'
														size='sm'
														onClick={() =>
															handleApprove(
																comment.id,
																true
															)
														}
													>
														<Check className='mr-1 w-4 h-4' />
														Approve
													</Button>
												) : (
													<Button
														variant='outline'
														size='sm'
														onClick={() =>
															handleApprove(
																comment.id,
																false
															)
														}
													>
														<X className='mr-1 w-4 h-4' />
														Reject
													</Button>
												)}
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant='destructive'
															size='sm'
														>
															<Trash2 className='w-4 h-4' />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Delete Comment?
															</AlertDialogTitle>
															<AlertDialogDescription>
																This action cannot be undone. This will
																permanently delete this comment.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>
																Cancel
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() =>
																	handleDelete(
																		comment.id
																	)
																}
															>
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className='flex justify-center gap-2'>
					<Button
						variant='outline'
						disabled={page === 1}
						onClick={() => setPage(page - 1)}
					>
						Previous
					</Button>
					<span className='flex items-center px-4 text-sm text-muted-foreground'>
						Page {page} of {totalPages}
					</span>
					<Button
						variant='outline'
						disabled={page === totalPages}
						onClick={() => setPage(page + 1)}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
