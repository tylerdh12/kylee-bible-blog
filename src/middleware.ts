import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for request processing.
 *
 * Current functionality:
 * - Sets x-pathname header for MaintenanceCheck component to detect admin routes
 *   and allow them to bypass maintenance mode
 *
 * Note: Authentication is handled at the component level (AdminLayout) to avoid
 * redirect loops and provide better UX with loading states.
 */
export function middleware(request: NextRequest) {
	const response = NextResponse.next();

	// Set pathname header for maintenance mode bypass detection
	response.headers.set('x-pathname', request.nextUrl.pathname);

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except static assets:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico and other static files
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
	],
};
