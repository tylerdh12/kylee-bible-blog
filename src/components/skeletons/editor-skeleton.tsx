import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Rich Text Editor Skeleton
export function EditorSkeleton() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='space-y-2'>
					<Skeleton className='h-8 w-48' />
					<Skeleton className='h-4 w-64' />
				</div>
				<div className='flex gap-2'>
					<Skeleton className='h-10 w-24' />
					<Skeleton className='h-10 w-32' />
				</div>
			</div>

			{/* Form Fields */}
			<div className='space-y-4'>
				<div className='space-y-2'>
					<Skeleton className='h-4 w-24' />
					<Skeleton className='h-10 w-full' />
				</div>
				<div className='space-y-2'>
					<Skeleton className='h-4 w-32' />
					<Skeleton className='h-24 w-full' />
				</div>
			</div>

			{/* Editor Toolbar */}
			<Card>
				<CardHeader>
					<div className='flex gap-2'>
						{Array.from({ length: 8 }).map((_, i) => (
							<Skeleton key={`toolbar-${i}`} className='h-8 w-8' />
						))}
					</div>
				</CardHeader>
				<CardContent>
					{/* Editor Content Area */}
					<div className='space-y-3 min-h-[400px]'>
						{Array.from({ length: 8 }).map((_, i) => (
							<Skeleton key={`line-${i}`} className='h-4 w-full' />
						))}
					</div>
				</CardContent>
			</Card>

			{/* Sidebar */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<div className='lg:col-span-2'>
					{/* Main content already shown above */}
				</div>
				<div className='space-y-4'>
					<Card>
						<CardHeader>
							<Skeleton className='h-6 w-32' />
						</CardHeader>
						<CardContent className='space-y-3'>
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={`meta-${i}`} className='space-y-2'>
									<Skeleton className='h-4 w-20' />
									<Skeleton className='h-8 w-full' />
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
