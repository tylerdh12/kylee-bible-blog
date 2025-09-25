import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip auth and logout endpoints
	if (pathname.startsWith('/api/auth/')) {
		return NextResponse.next();
	}

	// Only protect admin routes (except the login page itself)
	if (pathname.startsWith('/admin')) {
		// Allow access to the main admin page (login)
		if (pathname === '/admin') {
			return NextResponse.next();
		}

		// Middleware runs in the Edge runtime; avoid importing server-only utilities.
		// Perform a lightweight check for the presence of the auth cookie.
		const token = request.cookies.get('auth-token')?.value;

		if (!token) {
			return NextResponse.redirect(
				new URL('/admin', request.url)
			);
		}
	}

	// Let individual API routes handle their own authentication
	// This is more flexible and avoids middleware/route handler inconsistencies

	return NextResponse.next();
}

export const config = {
	matcher: [
		'/admin/:path*',
		'/api/admin/:path*',
		'/api/posts/:path*',
	],
};
