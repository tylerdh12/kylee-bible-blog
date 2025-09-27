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
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface EditPostPageProps {
	params: { id: string };
}

export default function EditPostPage({
	params,
}: EditPostPageProps) {
	const router = useRouter();
	const [post, setPost] = useState<any>(null);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] =
		useState(true);

	const fetchPost = useCallback(async () => {
		try {
			const response = await fetch(
				`/api/posts/${params.id}`
			);
			if (response.ok) {
				const data = await response.json();
				const postData = data.post;
				setPost(postData);
				setTitle(postData.title);
				setContent(postData.content);
				setExcerpt(postData.excerpt || '');
				setTags(
					postData.tags?.map((tag: any) => tag.name) || []
				);
			} else if (response.status === 404) {
				notFound();
			} else {
				alert('Failed to load post');
				router.push('/admin/posts');
			}
		} catch (error) {
			console.error('Error fetching post:', error);
			alert('Error loading post');
			router.push('/admin/posts');
		} finally {
			setInitialLoading(false);
		}
	}, [params.id, router]);

	useEffect(() => {
		fetchPost();
	}, [fetchPost]);

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
			alert('Title and content are required');
			return;
		}

		setLoading(true);
		try {
			const publishStatus =
				publish !== undefined ? publish : post.published;

			const response = await fetch(
				`/api/posts/${params.id}`,
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
				alert(
					publishStatus
						? 'Post updated and published!'
						: 'Post updated as draft!'
				);
				router.push('/admin/posts');
			} else {
				alert('Failed to update post');
			}
		} catch {
			alert('Error updating post');
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
			const response = await fetch(
				`/api/posts/${params.id}`,
				{
					method: 'DELETE',
				}
			);

			if (response.ok) {
				alert('Post deleted successfully');
				router.push('/admin/posts');
			} else {
				alert('Failed to delete post');
			}
		} catch {
			alert('Error deleting post');
		} finally {
			setLoading(false);
		}
	};

	if (initialLoading) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-4xl'>
				<div className='text-center py-12'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
					<p className='text-muted-foreground'>
						Loading post...
					</p>
				</div>
			</div>
		);
	}

	if (!post) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-4xl'>
				<div className='text-center py-12'>
					<p className='text-muted-foreground mb-4'>
						Post not found
					</p>
					<Link href='/admin/posts'>
						<Button variant='outline'>Back to Posts</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-4xl'>
			<div className='flex justify-between items-center mb-8'>
				<div className='flex items-center gap-4'>
					<Link href='/admin/posts'>
						<Button
							variant='ghost'
							size='sm'
						>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back to Posts
						</Button>
					</Link>
					<div>
						<h1 className='text-3xl font-bold'>
							Edit Post
						</h1>
						<p className='text-muted-foreground'>
							Status:{' '}
							<Badge
								variant={
									post.published ? 'default' : 'secondary'
								}
							>
								{post.published ? 'Published' : 'Draft'}
							</Badge>
						</p>
					</div>
				</div>
				<Button
					variant='destructive'
					onClick={handleDelete}
					disabled={loading}
				>
					Delete Post
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Edit Your Post</CardTitle>
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='space-y-2'>
						<Label htmlFor='title'>Title</Label>
						<Input
							id='title'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder='Enter your post title...'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='excerpt'>
							Excerpt (Optional)
						</Label>
						<Textarea
							id='excerpt'
							value={excerpt}
							onChange={(e) => setExcerpt(e.target.value)}
							placeholder='Brief summary of your post...'
							rows={3}
						/>
					</div>

					<div className='space-y-2'>
						<Label>Content</Label>
						<RichTextEditor
							content={content}
							onChange={setContent}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='tags'>Tags</Label>
						<div className='flex gap-2'>
							<Input
								id='tags'
								value={tagInput}
								onChange={(e) =>
									setTagInput(e.target.value)
								}
								onKeyPress={handleKeyPress}
								placeholder='Add a tag and press Enter'
							/>
							<Button
								type='button'
								onClick={addTag}
							>
								Add
							</Button>
						</div>
						{tags.length > 0 && (
							<div className='flex flex-wrap gap-2 mt-2'>
								{tags.map((tag) => (
									<Badge
										key={tag}
										variant='secondary'
										className='cursor-pointer'
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
						)}
					</div>

					<div className='flex gap-4 pt-4'>
						<Button
							onClick={() => handleSave(false)}
							disabled={loading}
							variant='outline'
						>
							{loading ? 'Saving...' : 'Save as Draft'}
						</Button>
						<Button
							onClick={() => handleSave(true)}
							disabled={loading}
						>
							{loading
								? 'Updating...'
								: post.published
								? 'Update & Keep Published'
								: 'Publish Post'}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
