import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function PostLoading() {
	return (
		<div className='min-h-screen bg-gradient-to-br from-background to-muted/10'>
			<div className='container px-4 py-8 mx-auto max-w-4xl'>
				{/* Breadcrumb Skeleton */}
				<div className='flex gap-2 items-center mb-8'>
					<Skeleton className='h-4 w-12' />
					<Skeleton className='h-4 w-4' />
					<Skeleton className='h-4 w-16' />
					<Skeleton className='h-4 w-4' />
					<Skeleton className='h-4 w-32' />
				</div>

				{/* Header Skeleton */}
				<div className='mb-12'>
					<Skeleton className='h-12 w-full mb-6' />
					<div className='flex flex-wrap gap-4 items-center pb-6 mb-6 border-b'>
						<Skeleton className='h-8 w-32' />
						<Skeleton className='h-8 w-40' />
					</div>
					<div className='flex flex-wrap gap-2 mb-8'>
						<Skeleton className='h-6 w-16' />
						<Skeleton className='h-6 w-20' />
						<Skeleton className='h-6 w-24' />
					</div>
				</div>

				{/* Content Skeleton */}
				<div className='mb-16 space-y-4'>
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-5/6' />
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-4/5' />
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-3/4' />
				</div>

				{/* CTA Section Skeleton */}
				<Card className='mt-16'>
					<CardContent className='p-8 text-center'>
						<Skeleton className='h-8 w-64 mx-auto mb-4' />
						<Skeleton className='h-4 w-full mb-6' />
						<div className='flex flex-col gap-4 justify-center sm:flex-row'>
							<Skeleton className='h-10 w-48' />
							<Skeleton className='h-10 w-48' />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
