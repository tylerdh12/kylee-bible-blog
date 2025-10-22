'use client';

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export default function CommentsPage() {
	const [loading] = useState(false);

	return (
		<>
			{loading ? (
				<div className='text-center py-8'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
					<p className='text-muted-foreground'>
						Loading...
					</p>
				</div>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Coming soon</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-muted-foreground'>
							Comments moderation UI will appear here.
						</p>
					</CardContent>
				</Card>
			)}
		</>
	);
}
