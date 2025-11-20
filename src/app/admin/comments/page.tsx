'use client';

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export default function CommentsPage() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Coming Soon</CardTitle>
			</CardHeader>
			<CardContent>
				<p className='text-muted-foreground'>
					Comments moderation tools will appear here soon.
				</p>
			</CardContent>
		</Card>
	);
}
