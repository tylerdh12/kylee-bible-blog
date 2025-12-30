import { auth } from '@/lib/better-auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

let handler: ReturnType<typeof toNextJsHandler>;

try {
	handler = toNextJsHandler(auth);
} catch (error) {
	// Log error details only in development
	if (process.env.NODE_ENV === 'development') {
		console.error(
			'[Better Auth] Failed to initialize handler:',
			error
		);
	}
	// Create a fallback handler that returns errors
	handler = {
		GET: async () =>
			NextResponse.json(
				{ error: 'Auth handler not initialized' },
				{ status: 500 }
			),
		POST: async () =>
			NextResponse.json(
				{ error: 'Auth handler not initialized' },
				{ status: 500 }
			),
	} as any;
}

// Wrap handlers to catch and log errors
export async function GET(request: NextRequest) {
	try {
		return await handler.GET(request);
	} catch (error) {
		// Log error details only in development
		if (process.env.NODE_ENV === 'development') {
			console.error('Better Auth GET Error:', error);
		}
		return NextResponse.json(
			{
				error: 'Internal server error',
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const url = new URL(request.url);

		// Ensure handler is initialized
		if (!handler) {
			if (process.env.NODE_ENV === 'development') {
				console.error(
					'[Better Auth] Handler not initialized'
				);
			}
			return NextResponse.json(
				{ error: 'Authentication service not available' },
				{ status: 500 }
			);
		}

		// For sign-in requests, check user role before allowing authentication
		// We need to read the body and reconstruct the request for better-auth
		let requestToPass = request;
		
		if (url.pathname.includes('/sign-in/email')) {
			try {
				// Read the body once
				const body = await request.json();
				const { email } = body;

				if (email) {
					// Check user role before allowing sign-in
					const { prisma } = await import('@/lib/db');
					const user = await prisma.user.findUnique({
						where: { email },
						select: { id: true, email: true, role: true, isActive: true },
					});

					if (user) {
						// Prevent subscribers from logging in
						if (user.role === 'SUBSCRIBER' || !user.role) {
							return NextResponse.json(
								{
									error: 'Access denied',
									message: 'Subscribers cannot log in. Please contact an administrator.',
								},
								{ status: 403 }
							);
						}

						// Check if user is active
						if (user.isActive === false) {
							return NextResponse.json(
								{
									error: 'Account deactivated',
									message: 'Your account has been deactivated. Please contact an administrator.',
								},
								{ status: 403 }
							);
						}
					}
				}

				// Reconstruct the request with the body for better-auth
				// Create a new request with the same URL and headers, but with the body
				requestToPass = new NextRequest(request.url, {
					method: request.method,
					headers: request.headers,
					body: JSON.stringify(body),
				});
			} catch (checkError) {
				// If we can't check, let better-auth handle it (will fail at password check anyway)
				if (process.env.NODE_ENV === 'development') {
					console.warn('[Better Auth] Could not pre-check user role:', checkError);
				}
				// If body reading failed, we can't reconstruct, so use original request
				requestToPass = request;
			}
		}

		const result = await handler.POST(requestToPass);

		// Handle signout - ensure cookies are properly cleared
		if (url.pathname.includes('/signout') || url.pathname.includes('/sign-out')) {
			// Better-auth should handle cookie clearing, but we ensure it happens
			// Convert the result to a NextResponse so we can modify cookies
			const isProduction = process.env.NODE_ENV === 'production';
			
			// Get response body if it exists
			let responseBody = null;
			let responseStatus = 200;
			if (result instanceof Response) {
				responseStatus = result.status;
				try {
					responseBody = await result.clone().json().catch(() => null);
				} catch {
					// If JSON parsing fails, try text
					try {
						responseBody = await result.clone().text().catch(() => null);
					} catch {
						responseBody = null;
					}
				}
			}
			
			// Create a new NextResponse
			const response = responseBody 
				? NextResponse.json(responseBody, { status: responseStatus })
				: new NextResponse(null, { status: responseStatus });

			// Copy headers from original response
			if (result instanceof Response) {
				result.headers.forEach((value, key) => {
					if (key.toLowerCase() !== 'set-cookie') {
						response.headers.set(key, value);
					}
				});
			}

			// Explicitly clear all possible session cookie names
			// HttpOnly cookies can only be cleared by the server
			// Must match the exact attributes the cookie was set with
			const cookieNames = [
				'__Secure-better-auth.session_token',
				'better-auth.session_token',
				'better-auth.sessionToken',
			];

			cookieNames.forEach((cookieName) => {
				// Clear with Secure flag (for HTTPS/production with __Secure- prefix)
				if (cookieName.startsWith('__Secure-') || isProduction) {
					response.cookies.set(cookieName, '', {
						expires: new Date(0),
						path: '/',
						sameSite: 'lax',
						secure: true,
						httpOnly: true,
					});
				}
				
				// Clear without Secure flag (for HTTP/development)
				response.cookies.set(cookieName, '', {
					expires: new Date(0),
					path: '/',
					sameSite: 'lax',
					secure: false,
					httpOnly: true,
				});
			});

			return response;
		}

		// After successful sign-in, verify the user is not a subscriber
		if (url.pathname.includes('/sign-in/email') && result.status === 200) {
			try {
				const clonedResult = result.clone();
				const resultData = await clonedResult.json();
				
				if (resultData.user) {
					// Double-check: if somehow a subscriber got through, revoke the session
					if (resultData.user.role === 'SUBSCRIBER' || !resultData.user.role) {
						if (process.env.NODE_ENV === 'development') {
							console.warn('[Better Auth] Subscriber attempted login, revoking session');
						}
						// Revoke any session that might have been created
						const { auth } = await import('@/lib/better-auth');
						const sessionCookie = request.cookies.get('better-auth.session_token')?.value ||
							request.cookies.get('better-auth.sessionToken')?.value;
						
						if (sessionCookie) {
							try {
								await auth.api.signOut({ headers: request.headers });
							} catch (signOutError) {
								if (process.env.NODE_ENV === 'development') {
									console.error('[Better Auth] Error revoking subscriber session:', signOutError);
								}
							}
						}

						return NextResponse.json(
							{
								error: 'Access denied',
								message: 'Subscribers cannot log in. Please contact an administrator.',
							},
							{ status: 403 }
						);
					}
				}
			} catch (verifyError) {
				// If we can't verify, log but don't block (better-auth already handled it)
				if (process.env.NODE_ENV === 'development') {
					console.warn('[Better Auth] Could not verify post-sign-in role:', verifyError);
				}
			}
		}

		// Check if result is a Response
		if (!(result instanceof Response)) {
			if (process.env.NODE_ENV === 'development') {
				console.error(
					'[Better Auth] Handler did not return a Response:',
					typeof result
				);
			}
			return NextResponse.json(
				{
					error: 'Internal server error',
				},
				{ status: 500 }
			);
		}

		// If error status, ensure we have a proper error response
		if (result.status >= 400) {
			// Clone to read without consuming
			const cloned = result.clone();
			try {
				const text = await cloned.text();

				// If the response body is empty, create a proper error response
				if (!text || text.trim() === '') {
					return NextResponse.json(
						{
							error: 'Authentication failed',
						},
						{ status: result.status }
					);
				}
			} catch (e) {
				if (process.env.NODE_ENV === 'development') {
					console.error(
						'[Better Auth] Could not read error response:',
						e
					);
				}
				// Return a proper error response if we can't read the original
				return NextResponse.json(
					{
						error: 'Authentication error',
					},
					{ status: result.status }
				);
			}
		}

		return result;
	} catch (error) {
		// Log error details only in development
		if (process.env.NODE_ENV === 'development') {
			console.error('Better Auth POST Error:', error);
		}

		return NextResponse.json(
			{
				error: 'Internal server error',
			},
			{ status: 500 }
		);
	}
}
