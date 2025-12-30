import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Create response with pathname header for maintenance check
	const response = NextResponse.next();

	// Set header so MaintenanceCheck component can detect admin routes
	// This allows /admin routes to bypass maintenance mode
	response.headers.set('x-pathname', pathname);

	// Skip auth endpoints
	if (pathname.startsWith('/api/auth/')) {
		return response;
	}

	// Skip API routes (they handle their own logic)
	if (pathname.startsWith('/api/')) {
		return response;
	}

	// Admin routes are protected by the AdminLayout component which handles authentication
	// We skip middleware checks for admin routes to avoid redirect loops
	// The AdminLayout component will handle redirecting unauthenticated users
	if (pathname.startsWith('/admin')) {
		return response;
	}

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (public folder)
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
	],
};
