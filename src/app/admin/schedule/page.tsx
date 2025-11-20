'use client';

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export default function SchedulePage() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Coming Soon</CardTitle>
			</CardHeader>
			<CardContent>
				<p className='text-muted-foreground'>
					Scheduling tools will appear here soon.
				</p>
			</CardContent>
		</Card>
	);
}
