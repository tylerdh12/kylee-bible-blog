'use client';

import {
	useEffect,
	useState,
	useCallback,
	useRef,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AdminLayoutSkeleton } from '@/components/skeletons/admin-skeletons';
import { UIUser } from '@/types';

interface AdminLayoutProps {
	children: React.ReactNode;
}

export default function AdminLayout({
	children,
}: AdminLayoutProps) {
	const [user, setUser] = useState<UIUser | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<
		boolean | null
	>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	const checkAuthStatus = useCallback(async () => {
		// Skip authentication check for password reset pages
		if (pathname?.startsWith('/admin/reset-password')) {
			setLoading(false);
			setIsAuthenticated(null); // Don't require auth for reset pages
			return;
		}

		// Don't show loading spinner if we're already authenticated and just navigating
		// Only show loading on initial check or when authentication state is unknown
		const shouldShowLoading = isAuthenticated === null;

		try {
			if (shouldShowLoading) {
				setLoading(true);
			}
			const response = await fetch('/api/auth/status', {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				cache: 'no-store',
			});

			// Handle 401 (unauthorized) as "not authenticated" - this is expected
			if (response.status === 401) {
				setIsAuthenticated(false);
				setUser(null);
				setLoading(false);
				// Redirect to login page if not already there
				if (pathname !== '/admin') {
					router.replace('/admin');
				}
				return;
			}

			// Handle other error status codes
			if (!response.ok) {
				console.error(
					`Auth status check failed: ${response.status}`
				);
				setIsAuthenticated(false);
				setUser(null);
				setLoading(false);
				// Redirect to login page if not already there
				if (pathname !== '/admin') {
					router.replace('/admin');
				}
				return;
			}

			const data = await response.json();

			if (data.authenticated && data.user) {
				// Check if user is ADMIN - only admins can access admin pages
				if (data.user.role !== 'ADMIN') {
					setIsAuthenticated(false);
					setUser(null);
					setLoading(false);
					// Redirect non-admin users away from admin area
					router.replace('/');
					return;
				}
				setIsAuthenticated(true);
				setUser(data.user);
				setLoading(false);
			} else {
				setIsAuthenticated(false);
				setUser(null);
				setLoading(false);
				// Redirect to login page if not already there
				if (pathname !== '/admin') {
					router.replace('/admin');
				}
			}
		} catch (error) {
			console.error('Auth check failed:', error);
			setIsAuthenticated(false);
			setUser(null);
			setLoading(false);
			// Redirect to login page if not already there
			if (pathname !== '/admin') {
				router.replace('/admin');
			}
		}
	}, [pathname, router, isAuthenticated]);

	// Track previous pathname to detect navigation
	const prevPathnameRef = useRef<string | null>(null);

	useEffect(() => {
		const prevPathname = prevPathnameRef.current;
		prevPathnameRef.current = pathname;

		// Only check auth status on initial mount or when navigating to/from reset-password pages
		// Don't re-check on every navigation between authenticated admin pages
		const isResetPasswordPage = pathname?.startsWith(
			'/admin/reset-password'
		);
		const wasResetPasswordPage = prevPathname?.startsWith(
			'/admin/reset-password'
		);

		// Only check auth if:
		// 1. Initial mount (prevPathname is null)
		// 2. We haven't checked yet (isAuthenticated is null)
		// 3. We're navigating to/from a reset password page
		// 4. We're not authenticated and navigating to a protected page
		if (
			prevPathname === null ||
			isAuthenticated === null ||
			isResetPasswordPage !== wasResetPasswordPage ||
			(!isAuthenticated && pathname !== '/admin')
		) {
			checkAuthStatus();
		}

		// Listen for authentication changes from login/logout
		const handleAuthChange = (event: CustomEvent) => {
			if (event.detail.authenticated && event.detail.user) {
				// Verify user is ADMIN before allowing access
				if (event.detail.user.role !== 'ADMIN') {
					setIsAuthenticated(false);
					setUser(null);
					setLoading(false);
					// Redirect non-admin users away from admin area
					router.replace('/');
					return;
				}
				setIsAuthenticated(true);
				setUser(event.detail.user);
				setLoading(false);
			} else {
				// Handle logout
				setIsAuthenticated(false);
				setUser(null);
				setLoading(false);
				// Redirect to login if not already there
				if (pathname !== '/admin') {
					router.push('/admin');
				}
			}
		};

		window.addEventListener(
			'auth-changed',
			handleAuthChange as EventListener
		);

		return () => {
			window.removeEventListener(
				'auth-changed',
				handleAuthChange as EventListener
			);
		};
	}, [pathname, router]); // Removed checkAuthStatus from dependencies to prevent re-running on every pathname change

	// Show skeleton loader while checking authentication
	if (loading) {
		return <AdminLayoutSkeleton />;
	}

	// Allow password reset pages to render without authentication
	if (pathname?.startsWith('/admin/reset-password')) {
		return <>{children}</>;
	}

	// If on main admin page and not authenticated, let the page handle login
	if (pathname === '/admin' && !isAuthenticated) {
		return <>{children}</>;
	}

	// For all other admin routes, require authentication AND ADMIN role
	if (!isAuthenticated || !user || user.role !== 'ADMIN') {
		// Show skeleton while redirecting (useEffect will handle redirect)
		// This prevents flash of content before redirect
		return <AdminLayoutSkeleton />;
	}

	// Generate breadcrumbs based on pathname
	const generateBreadcrumbs = () => {
		const segments = pathname.split('/').filter(Boolean);
		const breadcrumbs = [];

		// Always start with Dashboard
		breadcrumbs.push({
			label: 'Dashboard',
			href: '/admin',
		});

		// Don't add breadcrumbs for the root admin page
		if (segments.length <= 1) {
			return [{ label: 'Dashboard' }];
		}

		// Map segments to breadcrumbs
		for (let i = 1; i < segments.length; i++) {
			const segment = segments[i];
			const href = '/' + segments.slice(0, i + 1).join('/');

			// Convert segment to readable label
			let label =
				segment.charAt(0).toUpperCase() + segment.slice(1);

			// Handle special cases
			if (segment === 'new') {
				label = 'New';
			} else if (segment === 'edit') {
				label = 'Edit';
			} else if (segment === 'prayer-requests') {
				label = 'Prayer Requests';
			}

			// Don't add href for the last segment (current page)
			if (i === segments.length - 1) {
				breadcrumbs.push({ label });
			} else {
				breadcrumbs.push({ label, href });
			}
		}

		return breadcrumbs;
	};

	// Generate page title based on pathname
	const generateTitle = () => {
		const segments = pathname.split('/').filter(Boolean);

		if (segments.length <= 1) {
			return 'Admin Dashboard';
		}

		const lastSegment = segments[segments.length - 1];

		switch (lastSegment) {
			case 'posts':
				return 'Posts';
			case 'new':
				if (segments.includes('posts'))
					return 'Create New Post';
				if (segments.includes('goals'))
					return 'Create New Goal';
				return 'Create New';
			case 'edit':
				if (segments.includes('posts')) return 'Edit Post';
				if (segments.includes('goals')) return 'Edit Goal';
				return 'Edit';
			case 'goals':
				return 'Goals';
			case 'donations':
				return 'Donations';
			case 'comments':
				return 'Comments';
			case 'subscribers':
				return 'Subscribers';
			case 'schedule':
				return 'Schedule';
			case 'settings':
				return 'Settings';
			case 'profile':
				return 'Profile';
			case 'prayer-requests':
				return 'Prayer Requests';
			case 'site-content':
				return 'Site Content';
			default:
				return (
					lastSegment.charAt(0).toUpperCase() +
					lastSegment.slice(1)
				);
		}
	};

	// Generate description based on pathname
	const generateDescription = () => {
		const segments = pathname.split('/').filter(Boolean);

		if (segments.length <= 1) {
			return `Welcome back, ${user?.name || 'Admin'}!`;
		}

		const lastSegment = segments[segments.length - 1];

		switch (lastSegment) {
			case 'posts':
				return 'Create and manage your blog posts';
			case 'goals':
				return 'Create and manage your fundraising goals';
			case 'donations':
				return 'View and track donation history';
			case 'comments':
				return 'Review and moderate comments';
			case 'subscribers':
				return 'Manage your newsletter subscribers';
			case 'schedule':
				return 'Schedule and plan your content';
			case 'settings':
				return 'Configure your admin settings';
			case 'profile':
				return 'Manage your profile settings';
			case 'prayer-requests':
				return 'Manage prayer requests from visitors';
			case 'site-content':
				return 'Manage site content for home and about pages';
			case 'new':
				if (segments.includes('posts'))
					return 'Write and publish a new blog post';
				if (segments.includes('goals'))
					return 'Set up a new fundraising goal';
				return 'Create new content';
			case 'edit':
				if (segments.includes('posts'))
					return 'Update your blog post';
				if (segments.includes('goals'))
					return 'Update your fundraising goal';
				return 'Edit your content';
			default:
				return '';
		}
	};

	return (
		<DashboardLayout
			user={user}
			breadcrumbs={generateBreadcrumbs()}
			title={generateTitle()}
			description={generateDescription()}
		>
			{children}
		</DashboardLayout>
	);
}
