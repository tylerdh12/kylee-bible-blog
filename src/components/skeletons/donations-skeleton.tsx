import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Donations List Skeleton - matches DonationsListClient structure
export function DonationsListSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex justify-between items-center mb-6'>
				<div className='flex gap-2 items-center'>
					<Skeleton className='h-4 w-40' />
				</div>
				<Skeleton className='h-10 w-40 rounded-md' />
			</div>

			{/* Summary Card */}
			<Card className='mb-8'>
				<CardHeader>
					<CardTitle>
						<Skeleton className='h-6 w-40' />
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={`stat-${i}`} className='text-center'>
								<Skeleton className='h-8 w-32 mx-auto mb-2' />
								<Skeleton className='h-4 w-40 mx-auto' />
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Donations List Card */}
			<Card>
				<CardHeader>
					<CardTitle>
						<Skeleton className='h-6 w-40' />
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={`donation-${i}`}
								className='p-4 rounded-lg border'
							>
								<div className='flex justify-between items-start'>
									<div className='space-y-2'>
										<div className='flex gap-2 items-center'>
											<Skeleton className='h-5 w-24' />
											<Skeleton className='h-5 w-20 rounded-full' />
										</div>
										<Skeleton className='h-5 w-32 rounded-full' />
										<Skeleton className='h-4 w-64' />
									</div>
									<Skeleton className='h-3 w-32' />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
