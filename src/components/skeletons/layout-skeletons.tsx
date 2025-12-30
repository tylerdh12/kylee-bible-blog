import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Public Layout Skeleton - matches root layout with navbar
export function PublicLayoutSkeleton() {
	return (
		<div className='min-h-screen bg-background'>
			{/* Navbar Skeleton */}
			<nav className='fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='container mx-auto px-4'>
					<div className='flex h-16 items-center justify-between'>
						{/* Logo/Brand */}
						<div className='flex items-center gap-2'>
							<Skeleton className='h-8 w-8 rounded' />
							<Skeleton className='h-6 w-32 hidden md:block' />
						</div>

						{/* Navigation Links */}
						<div className='hidden md:flex items-center gap-6'>
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={`nav-${i}`} className='h-4 w-16' />
							))}
						</div>

						{/* Right side - Theme toggle and mobile menu */}
						<div className='flex items-center gap-2'>
							<Skeleton className='h-8 w-8 rounded-md' />
							<Skeleton className='h-8 w-8 rounded-md md:hidden' />
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className='pt-16 md:pt-[4.5rem] lg:pt-20 min-h-screen'>
				<div className='container mx-auto px-4 py-8'>
					{/* Page Header */}
					<div className='mb-12 text-center space-y-4'>
						<Skeleton className='h-10 w-64 mx-auto' />
						<Skeleton className='h-6 w-96 mx-auto max-w-2xl' />
					</div>

					{/* Content Grid */}
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{Array.from({ length: 6 }).map((_, i) => (
							<Card key={`content-${i}`}>
								<CardHeader>
									<Skeleton className='h-6 w-full' />
									<Skeleton className='h-4 w-3/4 mt-2' />
								</CardHeader>
								<CardContent>
									<Skeleton className='h-4 w-full mb-2' />
									<Skeleton className='h-4 w-5/6 mb-2' />
									<Skeleton className='h-4 w-4/6' />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
