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

	// Only protect admin routes (except the login page and password reset pages)
	if (pathname.startsWith('/admin')) {
		// Allow access to the main admin page (login)
		if (pathname === '/admin') {
			return response;
		}

		// Allow access to password reset pages (users aren't logged in when resetting)
		if (pathname.startsWith('/admin/reset-password')) {
			return response;
		}

		// Middleware runs in the Edge runtime; avoid importing server-only utilities.
		// Perform a lightweight check for the presence of the better-auth session cookie.
		// Better-auth uses 'better-auth.session_token' cookie (check both possible names)
		const sessionToken =
			request.cookies.get('better-auth.session_token')?.value ||
			request.cookies.get('better-auth.sessionToken')?.value;

		if (!sessionToken) {
			const url = new URL('/admin', request.url);
			// Add a query param to prevent caching
			url.searchParams.set('redirected', 'true');
			return NextResponse.redirect(url);
		}
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
