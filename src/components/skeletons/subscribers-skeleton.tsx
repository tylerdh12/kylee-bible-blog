import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

// Subscribers List Skeleton - matches SubscribersListClient structure
export function SubscribersListSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<Skeleton className='h-9 w-48 mb-2' />
					<Skeleton className='h-4 w-64' />
				</div>
				<div className='flex gap-2'>
					<Skeleton className='h-10 w-24 rounded-md' />
					<Skeleton className='h-10 w-36 rounded-md' />
				</div>
			</div>

			{/* Filters Card */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<div className='flex-1 relative'>
							<Skeleton className='h-10 w-full rounded-md' />
						</div>
						<Skeleton className='h-10 w-full sm:w-48 rounded-md' />
					</div>
				</CardContent>
			</Card>

			{/* Subscribers Table Card */}
			<Card>
				<CardHeader>
					<CardTitle>
						<Skeleton className='h-6 w-40' />
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>
									<Skeleton className='h-4 w-16' />
								</TableHead>
								<TableHead>
									<Skeleton className='h-4 w-16' />
								</TableHead>
								<TableHead>
									<Skeleton className='h-4 w-20' />
								</TableHead>
								<TableHead>
									<Skeleton className='h-4 w-24' />
								</TableHead>
								<TableHead className='text-right'>
									<Skeleton className='h-4 w-16 ml-auto' />
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 8 }).map((_, i) => (
								<TableRow key={`row-${i}`}>
									<TableCell>
										<Skeleton className='h-4 w-48' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-4 w-32' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-6 w-20 rounded-full' />
									</TableCell>
									<TableCell>
										<Skeleton className='h-4 w-24' />
									</TableCell>
									<TableCell className='text-right'>
										<Skeleton className='h-8 w-8 rounded-md ml-auto' />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
