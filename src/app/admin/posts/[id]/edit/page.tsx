'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface EditPostPageProps {
	params: Promise<{ id: string }>;
}

export default function EditPostPage({
	params,
}: EditPostPageProps) {
	const [id, setId] = useState<string>('');
	const router = useRouter();
	const [post, setPost] = useState<any>(null);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [published, setPublished] = useState(false);
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);

	const fetchPost = useCallback(async () => {
		try {
			// First fetch all posts to find the one we need
			const response = await fetch('/api/posts');
			if (response.ok) {
				const data = await response.json();
				const postData = data.posts?.find((p: any) => p.id === id);

				if (postData) {
					setPost(postData);
					setTitle(postData.title);
					setContent(postData.content);
					setExcerpt(postData.excerpt || '');
					setPublished(postData.published || false);
					setTags(
						postData.tags?.map((tag: any) => tag.name) || []
					);
				} else {
					notFound();
				}
			} else {
				toast.error('Failed to load post');
				router.push('/admin/posts');
			}
		} catch (error) {
			console.error('Error fetching post:', error);
			toast.error('Error loading post');
			router.push('/admin/posts');
		} finally {
			setInitialLoading(false);
		}
	}, [id, router]);

	useEffect(() => {
		params.then(({ id: paramId }) => {
			setId(paramId);
		});
	}, [params]);

	useEffect(() => {
		if (id) {
			fetchPost();
		}
	}, [fetchPost, id]);

	const addTag = () => {
		if (
			tagInput.trim() &&
			!tags.includes(tagInput.trim())
		) {
			setTags([...tags, tagInput.trim()]);
			setTagInput('');
		}
	};

	const removeTag = (tagToRemove: string) => {
		setTags(tags.filter((tag) => tag !== tagToRemove));
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag();
		}
	};

	const handleSave = async (publish?: boolean) => {
		if (!title.trim() || !content.trim()) {
			toast.error('Title and content are required');
			return;
		}

		setLoading(true);
		try {
			const publishStatus =
				publish !== undefined ? publish : published;

			const slug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');

			const response = await fetch(
				`/api/posts/${slug}/${id}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						title,
						content,
						excerpt: excerpt || null,
						published: publishStatus,
						tags,
					}),
				}
			);

			if (response.ok) {
				toast.success(
					publishStatus
						? 'Post updated and published!'
						: 'Post updated as draft!'
				);
				router.push('/admin/posts');
			} else {
				const error = await response.json();
				toast.error(error.message || 'Failed to update post');
			}
		} catch (error) {
			console.error('Error updating post:', error);
			toast.error('Error updating post');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (
			!confirm(
				'Are you sure you want to delete this post? This action cannot be undone.'
			)
		) {
			return;
		}

		setLoading(true);
		try {
			const slug = post.slug || title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');

			const response = await fetch(
				`/api/posts/${slug}/${id}`,
				{
					method: 'DELETE',
				}
			);

			if (response.ok) {
				toast.success('Post deleted successfully');
				router.push('/admin/posts');
			} else {
				const error = await response.json();
				toast.error(error.message || 'Failed to delete post');
			}
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Error deleting post');
		} finally {
			setLoading(false);
		}
	};

	if (initialLoading) {
		return (
			<div className='text-center py-12'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
				<p className='text-muted-foreground'>Loading post...</p>
			</div>
		);
	}

	if (!post) {
		return (
			<div className='text-center py-12'>
				<p className='text-muted-foreground mb-4'>Post not found</p>
				<Link href='/admin/posts'>
					<Button variant='outline'>Back to Posts</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Link href='/admin/posts'>
						<Button variant='outline' size='sm'>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Posts
						</Button>
					</Link>
					<div>
						<h1 className='text-3xl font-bold'>Edit Post</h1>
						<p className='text-muted-foreground'>Update your biblical insights</p>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					{post?.published && post?.slug && (
						<Button
							type='button'
							variant='outline'
							asChild
						>
							<Link href={`/posts/${post.slug}`} target='_blank'>
								<Eye className='w-4 h-4 mr-2' />
								View Published
							</Link>
						</Button>
					)}
					<Button
						variant='destructive'
						onClick={handleDelete}
						disabled={loading}
					>
						<Trash2 className='w-4 h-4 mr-2' />
						Delete
					</Button>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Main Content */}
				<div className='lg:col-span-2 space-y-6'>
					<Card>
						<CardHeader>
							<CardTitle>Post Content</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='title'>Title *</Label>
								<Input
									id='title'
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder='Enter your post title...'
									className='text-lg'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='excerpt'>Excerpt (Optional)</Label>
								<Textarea
									id='excerpt'
									value={excerpt}
									onChange={(e) => setExcerpt(e.target.value)}
									placeholder='Brief summary of your post...'
									rows={3}
								/>
								<p className='text-sm text-muted-foreground'>
									Optional. If not provided, the first 150 characters of content will be used.
								</p>
							</div>

							<div className='space-y-2'>
								<Label>Content *</Label>
								<RichTextEditor
									content={content}
									onChange={setContent}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className='space-y-6'>
					{/* Publishing Options */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Publishing</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label htmlFor='published' className='font-normal'>
										Publication Status
									</Label>
									<p className='text-sm text-muted-foreground'>
										{published ? 'Post is public' : 'Saved as draft'}
									</p>
								</div>
								<Switch
									id='published'
									checked={published}
									onCheckedChange={setPublished}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Tags */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg'>Tags</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='tags'>Add Tag</Label>
								<div className='flex gap-2'>
									<Input
										id='tags'
										value={tagInput}
										onChange={(e) =>
											setTagInput(e.target.value)
										}
										onKeyPress={handleKeyPress}
										placeholder='bible-study'
									/>
									<Button
										type='button'
										onClick={addTag}
										variant='outline'
										size='sm'
									>
										Add
									</Button>
								</div>
							</div>
							{tags.length > 0 && (
								<div>
									<Label>Current Tags</Label>
									<div className='flex flex-wrap gap-2 mt-2'>
										{tags.map((tag) => (
											<Badge
												key={tag}
												variant='secondary'
											>
												{tag}
												<button
													onClick={() => removeTag(tag)}
													className='ml-2 hover:text-destructive'
												>
													×
												</button>
											</Badge>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			<div className='flex justify-end gap-4 border-t pt-6'>
				<Button
					type='button'
					variant='outline'
					onClick={() => router.back()}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					type='button'
					variant='outline'
					onClick={() => handleSave(false)}
					disabled={loading}
				>
					{loading ? 'Saving...' : 'Save as Draft'}
				</Button>
				<Button
					type='button'
					onClick={() => handleSave(published)}
					disabled={loading}
				>
					<Save className='w-4 h-4 mr-2' />
					{loading ? 'Updating...' : published ? 'Update & Publish' : 'Save Post'}
				</Button>
			</div>
		</div>
	);
}
