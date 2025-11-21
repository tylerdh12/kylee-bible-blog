'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function PreviewPostPage() {
	const [previewData, setPreviewData] = useState<any>(null);

	useEffect(() => {
		const data = sessionStorage.getItem('previewPost');
		if (data) {
			setPreviewData(JSON.parse(data));
		}
	}, []);

	if (!previewData) {
		return (
			<div className='max-w-4xl mx-auto p-6'>
				<div className='text-center py-12'>
					<h2 className='text-2xl font-semibold mb-2'>No Preview Data</h2>
					<p className='text-muted-foreground mb-6'>
						Please return to the editor and try again.
					</p>
					<Button onClick={() => window.close()}>Close Preview</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto p-6 space-y-6'>
			<div className='flex items-center justify-between'>
				<Button variant='outline' size='sm' onClick={() => window.close()}>
					<ArrowLeft className='w-4 h-4 mr-2' />
					Close Preview
				</Button>
				<Badge variant={previewData.published ? 'default' : 'secondary'}>
					{previewData.published ? 'Published' : 'Draft'}
				</Badge>
			</div>

			<Card>
				<CardContent className='p-8'>
					<div className='space-y-6'>
						{/* Header */}
						<div className='space-y-4'>
							<h1 className='text-4xl font-bold tracking-tight'>
								{previewData.title || 'Untitled Post'}
							</h1>

							<div className='flex items-center gap-4 text-sm text-muted-foreground'>
								<span>
									{format(new Date(), 'MMMM dd, yyyy')}
								</span>
								{previewData.tags && previewData.tags.length > 0 && (
									<span>•</span>
								)}
								{previewData.tags && previewData.tags.length > 0 && (
									<div className='flex flex-wrap gap-2'>
										{previewData.tags.map((tag: any) => (
											<Badge key={tag.id} variant='outline'>
												{tag.name}
											</Badge>
										))}
									</div>
								)}
							</div>

							{previewData.excerpt && (
								<p className='text-lg text-muted-foreground italic border-l-4 border-primary pl-4'>
									{previewData.excerpt}
								</p>
							)}
						</div>

						<hr className='my-6' />

						{/* Content */}
						<div
							className='prose prose-lg max-w-none dark:prose-invert'
							dangerouslySetInnerHTML={{ __html: previewData.content }}
						/>
					</div>
				</CardContent>
			</Card>

			<div className='text-center text-sm text-muted-foreground'>
				<p>This is a preview of how your post will appear to readers.</p>
			</div>
		</div>
	);
}
