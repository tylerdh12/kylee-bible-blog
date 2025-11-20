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

export default function CommentsPage() {
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [approvalFilter, setApprovalFilter] = useState<string>('all');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
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
		return (
			<div className='text-center py-8'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
				<p className='text-muted-foreground'>Loading comments...</p>
			</div>
		);
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
			<div className='space-y-4'>
				{filteredComments.length === 0 ? (
					<Card>
						<CardContent className='py-12'>
							<div className='text-center space-y-4'>
								<div className='mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center'>
									<MessageCircle className='h-8 w-8 text-muted-foreground' />
								</div>
								<div>
									<h3 className='text-lg font-semibold'>
										{searchQuery
											? 'No comments found'
											: 'No comments yet'}
									</h3>
									<p className='text-muted-foreground'>
										{searchQuery
											? 'Try adjusting your search terms'
											: 'Comments will appear here when readers engage with your posts'}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				) : (
					filteredComments.map((comment) => (
						<Card
							key={comment.id}
							className={
								!comment.isApproved
									? 'border-l-4 border-l-yellow-500'
									: ''
							}
						>
							<CardHeader>
								<div className='flex items-start justify-between gap-4'>
									<div className='flex items-start gap-3 flex-1'>
										<Avatar>
											<AvatarImage
												src={comment.author.avatar}
												alt={comment.author.name}
											/>
											<AvatarFallback>
												{comment.author.name?.charAt(0) || 'U'}
											</AvatarFallback>
										</Avatar>
										<div className='flex-1 space-y-1'>
											<div className='flex items-center gap-2 flex-wrap'>
												<span className='font-semibold'>
													{comment.author.name ||
														'Anonymous'}
												</span>
												<Badge
													variant='outline'
													className='text-xs'
												>
													{comment.author.role}
												</Badge>
												{comment.isApproved ? (
													<Badge
														variant='default'
														className='text-xs'
													>
														<Check className='h-3 w-3 mr-1' />
														Approved
													</Badge>
												) : (
													<Badge
														variant='secondary'
														className='text-xs'
													>
														Pending
													</Badge>
												)}
											</div>
											<div className='text-sm text-muted-foreground'>
												{comment.author.email}
											</div>
											<div className='text-xs text-muted-foreground'>
												{format(
													new Date(comment.createdAt),
													'PPp'
												)}{' '}
												on{' '}
												<Link
													href={`/posts/${comment.post.slug}`}
													target='_blank'
													className='text-primary hover:underline inline-flex items-center gap-1'
												>
													{comment.post.title}
													<ExternalLink className='h-3 w-3' />
												</Link>
											</div>
										</div>
									</div>
									<div className='flex items-center gap-2'>
										{!comment.isApproved && (
											<Button
												size='sm'
												variant='default'
												onClick={() =>
													handleApprove(comment.id, true)
												}
											>
												<Check className='h-4 w-4 mr-1' />
												Approve
											</Button>
										)}
										{comment.isApproved && (
											<Button
												size='sm'
												variant='outline'
												onClick={() =>
													handleApprove(comment.id, false)
												}
											>
												<X className='h-4 w-4 mr-1' />
												Unapprove
											</Button>
										)}
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													size='sm'
													variant='outline'
													className='text-destructive hover:text-destructive'
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Delete Comment
													</AlertDialogTitle>
													<AlertDialogDescription>
														Are you sure you want to delete
														this comment? This action cannot
														be undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>
														Cancel
													</AlertDialogCancel>
													<AlertDialogAction
														onClick={() =>
															handleDelete(comment.id)
														}
														className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								{comment.parent && (
									<div className='mb-3 p-3 bg-muted/50 rounded-md border-l-2 border-primary'>
										<p className='text-xs text-muted-foreground mb-1'>
											Reply to {comment.parent.author.name}:
										</p>
										<p className='text-sm italic line-clamp-2'>
											{comment.parent.content}
										</p>
									</div>
								)}
								<div className='p-4 bg-muted/30 rounded-md'>
									<p className='whitespace-pre-wrap'>
										{comment.content}
									</p>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>

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
					<div className='flex items-center gap-2'>
						<span className='text-sm text-muted-foreground'>
							Page {page} of {totalPages}
						</span>
					</div>
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
