'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Save, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/rich-text-editor';

interface Tag {
	id: string;
	name: string;
}

export default function NewPostPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [pageLoading, setPageLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [availableTags, setAvailableTags] = useState<Tag[]>([]);
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [newTagInput, setNewTagInput] = useState('');
	const [useRichEditor, setUseRichEditor] = useState(true);
	const [formData, setFormData] = useState({
		title: '',
		content: '',
		excerpt: '',
		published: false,
		scheduledAt: '',
	});

	useEffect(() => {
		fetchTags();
	}, []);

	const fetchTags = async () => {
		try {
			setError(null);
			const response = await fetch('/api/tags');
			if (response.ok) {
				const data = await response.json();
				setAvailableTags(data.tags || []);
			} else {
				console.error('Failed to fetch tags: HTTP', response.status);
				// Continue even if tags fail to load
			}
		} catch (error) {
			console.error('Failed to fetch tags:', error);
			// Continue even if tags fail to load
		} finally {
			setPageLoading(false);
		}
	};

	const handleAddTag = (tagName: string) => {
		if (!tagName.trim()) return;

		const existingTag = availableTags.find(tag =>
			tag.name.toLowerCase() === tagName.toLowerCase()
		);

		if (existingTag) {
			if (!selectedTags.find(tag => tag.id === existingTag.id)) {
				setSelectedTags([...selectedTags, existingTag]);
			}
		} else {
			const newTag = {
				id: `new-${Date.now()}`,
				name: tagName.trim(),
			};
			setSelectedTags([...selectedTags, newTag]);
			setAvailableTags([...availableTags, newTag]);
		}
		setNewTagInput('');
	};

	const handleRemoveTag = (tagId: string) => {
		setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
	};

	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const slug = generateSlug(formData.title);
			const response = await fetch('/api/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...formData,
					slug,
					tags: selectedTags.map(tag => tag.name),
					scheduledAt: formData.scheduledAt || null,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				toast.success('Post created successfully!');
				router.push('/admin/posts');
			} else {
				const errorData = await response.json();
				const errorMessage = errorData.error || errorData.message || 'Failed to create post';
				setError(errorMessage);
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error('Error creating post:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
			setError(errorMessage);
			toast.error('Failed to create post. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const handlePreview = () => {
		const previewData = {
			...formData,
			slug: generateSlug(formData.title),
			tags: selectedTags,
		};
		// Store in sessionStorage for preview
		sessionStorage.setItem('previewPost', JSON.stringify(previewData));
		window.open('/admin/posts/preview', '_blank');
	};

	// Show loading state while page initializes
	if (pageLoading) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4' />
					<p className='text-muted-foreground'>Loading editor...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{error && (
				<div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md'>
					<p className='font-semibold'>Error</p>
					<p className='text-sm'>{error}</p>
				</div>
			)}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Link href='/admin/posts'>
						<Button variant='outline' size='sm'>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Posts
						</Button>
					</Link>
					<div>
						<h1 className='text-3xl font-bold'>Create New Post</h1>
						<p className='text-muted-foreground'>Share your biblical insights with the community</p>
					</div>
				</div>
				<Button
					type='button'
					variant='outline'
					onClick={handlePreview}
					disabled={!formData.title || !formData.content}
				>
					<Eye className='w-4 h-4 mr-2' />
					Preview
				</Button>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Main Content */}
					<div className='lg:col-span-2 space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Post Content</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<Label htmlFor='title'>Title *</Label>
									<Input
										id='title'
										value={formData.title}
										onChange={(e) =>
											setFormData({
												...formData,
												title: e.target.value,
											})
										}
										placeholder='Enter post title'
										required
										className='text-lg'
									/>
									{formData.title && (
										<p className='text-sm text-muted-foreground mt-1'>
											Slug: {generateSlug(formData.title)}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor='excerpt'>Excerpt</Label>
									<Textarea
										id='excerpt'
										value={formData.excerpt}
										onChange={(e) =>
											setFormData({
												...formData,
												excerpt: e.target.value,
											})
										}
										placeholder='Brief description that will appear in post previews'
										rows={3}
									/>
									<p className='text-sm text-muted-foreground mt-1'>
										Optional. If not provided, the first 150 characters of content will be used.
									</p>
								</div>

								<div>
									<div className='flex items-center justify-between mb-2'>
										<Label htmlFor='content'>Content *</Label>
										<div className='flex items-center space-x-2'>
											<Label htmlFor='rich-editor' className='text-sm'>Rich Editor</Label>
											<Switch
												id='rich-editor'
												checked={useRichEditor}
												onCheckedChange={setUseRichEditor}
											/>
										</div>
									</div>
									{useRichEditor ? (
										<div className='rich-editor-wrapper'>
											<RichTextEditor
												content={formData.content}
												onChange={(content) =>
													setFormData({
														...formData,
														content,
													})
												}
												placeholder='Write your biblical insights here...'
											/>
										</div>
									) : (
										<Textarea
											id='content'
											value={formData.content}
											onChange={(e) =>
												setFormData({
													...formData,
													content: e.target.value,
												})
											}
											placeholder='Write your biblical insights here...

You can use Markdown formatting or switch to the rich editor above.'
											rows={20}
											required
											className='font-mono text-sm'
										/>
									)}
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
								<div className='flex items-center space-x-2'>
									<Switch
										id='published'
										checked={formData.published}
										onCheckedChange={(checked) =>
											setFormData({
												...formData,
												published: checked,
											})
										}
									/>
									<Label htmlFor='published' className='font-normal'>
										{formData.published ? 'Publish immediately' : 'Save as draft'}
									</Label>
								</div>

								{!formData.published && (
									<div>
										<Label htmlFor='scheduledAt'>Schedule for later</Label>
										<Input
											id='scheduledAt'
											type='datetime-local'
											value={formData.scheduledAt}
											onChange={(e) =>
												setFormData({
													...formData,
													scheduledAt: e.target.value,
												})
											}
											min={new Date().toISOString().slice(0, 16)}
										/>
										<p className='text-sm text-muted-foreground mt-1'>
											Optional. Leave empty to save as draft.
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Tags */}
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Tags</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<Label>Add Tag</Label>
									<div className='flex gap-2'>
										<Input
											value={newTagInput}
											onChange={(e) => setNewTagInput(e.target.value)}
											placeholder='bible-study'
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													handleAddTag(newTagInput);
												}
											}}
										/>
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={() => handleAddTag(newTagInput)}
										>
											Add
										</Button>
									</div>
								</div>

								{selectedTags.length > 0 && (
									<div>
										<Label>Selected Tags</Label>
										<div className='flex flex-wrap gap-2 mt-2'>
											{selectedTags.map((tag) => (
												<Badge
													key={tag.id}
													variant='secondary'
													className='flex items-center gap-1'
												>
													{tag.name}
													<button
														type='button'
														onClick={() => handleRemoveTag(tag.id)}
														className='ml-1 hover:text-destructive'
													>
														<X className='w-3 h-3' />
													</button>
												</Badge>
											))}
										</div>
									</div>
								)}

								{availableTags.length > 0 && (
									<div>
										<Label>Popular Tags</Label>
										<div className='flex flex-wrap gap-2 mt-2'>
											{availableTags
												.filter(tag => !selectedTags.find(selected => selected.id === tag.id))
												.slice(0, 10)
												.map((tag) => (
													<Badge
														key={tag.id}
														variant='outline'
														className='cursor-pointer hover:bg-primary hover:text-primary-foreground'
														onClick={() => handleAddTag(tag.name)}
													>
														{tag.name}
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
					>
						Cancel
					</Button>
					<Button
						type='button'
						variant='outline'
						onClick={() => setFormData({ ...formData, published: false })}
						disabled={loading}
					>
						Save Draft
					</Button>
					<Button type='submit' disabled={loading}>
						<Save className='w-4 h-4 mr-2' />
						{loading ? 'Saving...' : formData.published ? 'Publish Post' : 'Save Post'}
					</Button>
				</div>
			</form>
		</div>
	);
}