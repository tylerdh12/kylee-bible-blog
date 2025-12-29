'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { UIUser } from '@/types';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<UIUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuthStatus();

    // Listen for authentication changes from login
    const handleAuthChange = (event: CustomEvent) => {
      if (event.detail.authenticated) {
        setIsAuthenticated(true);
        setUser(event.detail.user);
        setLoading(false);
      }
    };

    window.addEventListener('auth-changed', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange as EventListener);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        // Only redirect if not on the main admin login page
        if (pathname !== '/admin') {
          router.push('/admin');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      if (pathname !== '/admin') {
        router.push('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        role="main"
        aria-label="Loading admin dashboard"
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
            role="status"
            aria-label="Loading"
          />
          <p className="text-muted-foreground" aria-live="polite">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If on main admin page and not authenticated, let the page handle login
  if (pathname === '/admin' && !isAuthenticated) {
    return <>{children}</>;
  }

  // For all other admin routes, require authentication
  if (!isAuthenticated || !user) {
    return null; // Will redirect to /admin via the effect above
  }

  // Generate breadcrumbs based on pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Always start with Dashboard
    breadcrumbs.push({ label: 'Dashboard', href: '/admin' });

    // Don't add breadcrumbs for the root admin page
    if (segments.length <= 1) {
      return [{ label: 'Dashboard' }];
    }

    // Map segments to breadcrumbs
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      const href = '/' + segments.slice(0, i + 1).join('/');

      // Convert segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);

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
        if (segments.includes('posts')) return 'Create New Post';
        if (segments.includes('goals')) return 'Create New Goal';
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
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
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
        if (segments.includes('posts')) return 'Write and publish a new blog post';
        if (segments.includes('goals')) return 'Set up a new fundraising goal';
        return 'Create new content';
      case 'edit':
        if (segments.includes('posts')) return 'Update your blog post';
        if (segments.includes('goals')) return 'Update your fundraising goal';
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