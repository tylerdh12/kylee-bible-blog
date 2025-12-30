import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Schedule Page Skeleton - matches SchedulePage structure
export function ScheduleSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<Skeleton className='h-8 w-48 mb-2' />
					<Skeleton className='h-4 w-80' />
				</div>
				<Skeleton className='h-10 w-28 rounded-md' />
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Calendar Card */}
				<Card className='lg:col-span-2'>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Skeleton className='h-5 w-5 rounded' />
								<Skeleton className='h-6 w-32' />
							</div>
							<div className='flex gap-2'>
								<Skeleton className='h-8 w-20 rounded-md' />
								<Skeleton className='h-8 w-16 rounded-md' />
								<Skeleton className='h-8 w-16 rounded-md' />
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{/* Calendar Grid */}
						<div className='grid grid-cols-7 gap-2'>
							{/* Day Headers */}
							{Array.from({ length: 7 }).map((_, i) => (
								<div key={`header-${i}`} className='text-center py-2'>
									<Skeleton className='h-4 w-8 mx-auto' />
								</div>
							))}
							{/* Calendar Days */}
							{Array.from({ length: 35 }).map((_, i) => (
								<div
									key={`day-${i}`}
									className='aspect-square border rounded-md p-1'
								>
									<Skeleton className='h-3 w-4 mb-1' />
									<div className='space-y-1'>
										<Skeleton className='h-3 w-full rounded' />
										<Skeleton className='h-3 w-3/4 rounded' />
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Sidebar */}
				<div className='space-y-6'>
					{/* Upcoming Posts */}
					<Card>
						<CardHeader>
							<CardTitle>
								<Skeleton className='h-6 w-40' />
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-3'>
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={`upcoming-${i}`} className='space-y-2'>
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-3 w-24' />
								</div>
							))}
						</CardContent>
					</Card>

					{/* Draft Posts */}
					<Card>
						<CardHeader>
							<CardTitle>
								<Skeleton className='h-6 w-32' />
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-3'>
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={`draft-${i}`} className='space-y-2'>
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-3 w-20' />
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
