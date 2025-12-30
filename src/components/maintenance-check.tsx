import { isMaintenanceMode } from '@/lib/settings';
import { getAuthenticatedUser } from '@/lib/auth-new';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import {
	ConditionalNavbar,
	ConditionalMainLayout,
} from '@/components/conditional-navbar';
import { ErrorBoundary } from '@/components/error-boundary';
import { headers } from 'next/headers';

// Force dynamic rendering - don't cache this component
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Server Component that checks maintenance mode and conditionally renders
 * either the maintenance page or the actual content.
 * Admin routes and admin users can always access the site even during maintenance.
 */
export default async function MaintenanceCheck({
	children,
}: {
	children: React.ReactNode;
}) {
	try {
		// Get the current pathname from headers (set by middleware)
		// Admin routes should always bypass maintenance mode so admins can log in
		// During build time, headers() may not be available - handle gracefully
		let pathname = '';
		try {
			const headersList = await headers();
			pathname = headersList.get('x-pathname') || '';
		} catch (headerError: any) {
			// During build/static generation, headers() may not be available
			// This is expected and we'll just proceed without pathname check
			if (
				process.env.NODE_ENV === 'development' &&
				headerError?.digest !== 'DYNAMIC_SERVER_USAGE'
			) {
				console.warn(
					'[MaintenanceCheck] Could not read headers:',
					headerError
				);
			}
		}
		
		// Check if this is an admin route - allow access even during maintenance
		// This allows admins to log in and disable maintenance mode
		const isAdminRoute = pathname.startsWith('/admin');

		// Check if maintenance mode is enabled
		const maintenanceMode = await isMaintenanceMode();

		// Debug logging (only in development)
		if (process.env.NODE_ENV === 'development') {
			console.log(
				'[MaintenanceCheck] Pathname:',
				pathname,
				'Maintenance mode:',
				maintenanceMode,
				'Is admin route:',
				isAdminRoute
			);
		}

		// Admin routes always bypass maintenance check
		// This allows admins to access /admin to log in even during maintenance
		if (isAdminRoute) {
			if (process.env.NODE_ENV === 'development') {
				console.log('[MaintenanceCheck] Admin route detected - bypassing maintenance check');
			}
			return (
				<>
					<ConditionalNavbar />
					<ConditionalMainLayout>
						<ErrorBoundary>{children}</ErrorBoundary>
					</ConditionalMainLayout>
				</>
			);
		}

		// If maintenance mode is off, render children normally with layout
		if (!maintenanceMode) {
			return (
				<>
					<ConditionalNavbar />
					<ConditionalMainLayout>
						<ErrorBoundary>{children}</ErrorBoundary>
					</ConditionalMainLayout>
				</>
			);
		}

		// If maintenance mode is on, check if user is admin
		// Admins should be able to access the site to disable maintenance mode
		try {
			const user = await getAuthenticatedUser();
			const isAdmin =
				user?.role === 'ADMIN' ||
				user?.role === 'DEVELOPER';

			if (process.env.NODE_ENV === 'development') {
				console.log(
					'[MaintenanceCheck] User role:',
					user?.role,
					'Is admin:',
					isAdmin
				);
			}

			if (isAdmin) {
				// Admin users can access the site during maintenance with full layout
				return (
					<>
						<ConditionalNavbar />
						<ConditionalMainLayout>
							<ErrorBoundary>{children}</ErrorBoundary>
						</ConditionalMainLayout>
					</>
				);
			}
		} catch (error) {
			// If auth check fails, assume not admin and show maintenance page
			if (process.env.NODE_ENV === 'development') {
				console.error(
					'[MaintenanceCheck] Error checking admin status:',
					error
				);
			}
		}

		// Show maintenance page for non-admin users during maintenance
		// No navbar or main layout - just the maintenance message
		if (process.env.NODE_ENV === 'development') {
			console.log(
				'[MaintenanceCheck] Showing maintenance page'
			);
		}
		return (
			<div className='flex justify-center items-center p-4 min-h-screen bg-gradient-to-br from-background to-muted/10'>
				<Card className='w-full max-w-md'>
					<CardHeader className='text-center'>
						<div className='flex justify-center mb-4'>
							<div className='p-4 rounded-full bg-primary/10'>
								<Wrench className='w-12 h-12 text-primary' />
							</div>
						</div>
						<CardTitle className='text-2xl'>
							Site Under Maintenance
						</CardTitle>
						<CardDescription>
							We're currently performing some updates to
							improve your experience.
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4 text-center'>
						<p className='text-muted-foreground'>
							We'll be back online shortly. Thank you for
							your patience!
						</p>
						<div className='pt-4 border-t'>
							<p className='text-sm text-muted-foreground'>
								If you're an administrator, you can disable
								maintenance mode from the{' '}
								<a
									href='/admin/settings'
									className='font-medium text-primary hover:underline'
								>
									admin settings
								</a>
								.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	} catch (error: any) {
		// If maintenance check fails, fail open - show the site normally
		// During build time, headers() may not be available - this is expected
		// Only log errors in development or if it's not a build-time error
		if (
			process.env.NODE_ENV === 'development' &&
			error?.digest !== 'DYNAMIC_SERVER_USAGE'
		) {
			console.error(
				'[MaintenanceCheck] Error checking maintenance mode:',
				error
			);
		}
		return (
			<>
				<ConditionalNavbar />
				<ConditionalMainLayout>
					<ErrorBoundary>{children}</ErrorBoundary>
				</ConditionalMainLayout>
			</>
		);
	}
}
