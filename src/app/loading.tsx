import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
	return (
		<div className='container px-4 py-8 mx-auto'>
			{/* Hero Section Skeleton */}
			<div className='mb-12 text-center'>
				<Skeleton className='h-12 w-96 mx-auto mb-4' />
				<Skeleton className='h-6 w-full max-w-2xl mx-auto' />
			</div>

			{/* Recent Posts Section Skeleton */}
			<div className='space-y-12'>
				<div>
					<div className='flex justify-between items-center mb-6'>
						<Skeleton className='h-9 w-48' />
						<Skeleton className='h-6 w-32' />
					</div>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{Array.from({ length: 6 }).map((_, i) => (
							<Card key={i} className='transition-shadow'>
								<CardHeader>
									<Skeleton className='h-6 w-full mb-2' />
									<Skeleton className='h-4 w-3/4' />
								</CardHeader>
								<CardContent>
									<Skeleton className='h-4 w-full mb-2' />
									<Skeleton className='h-4 w-full mb-2' />
									<Skeleton className='h-4 w-5/6 mb-4' />
									<div className='flex gap-2 mb-4'>
										<Skeleton className='h-6 w-16' />
										<Skeleton className='h-6 w-20' />
									</div>
									<Skeleton className='h-4 w-24' />
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* Goals Section Skeleton */}
				<div>
					<div className='flex justify-between items-center mb-6'>
						<Skeleton className='h-9 w-48' />
					</div>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
						{Array.from({ length: 3 }).map((_, i) => (
							<Card key={i}>
								<CardHeader>
									<Skeleton className='h-6 w-full mb-2' />
									<Skeleton className='h-4 w-full' />
								</CardHeader>
								<CardContent>
									<div className='mb-4'>
										<div className='flex justify-between mb-2'>
											<Skeleton className='h-4 w-16' />
											<Skeleton className='h-4 w-20' />
										</div>
										<Skeleton className='h-2 w-full rounded-full' />
										<Skeleton className='h-4 w-20 mx-auto mt-2' />
									</div>
									<Skeleton className='h-4 w-full' />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
