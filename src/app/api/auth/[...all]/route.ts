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
		const url = new URL(request.url);
		
		// Debug logging for passkey routes
		if (process.env.NODE_ENV === 'development' && url.pathname.includes('passkey')) {
			console.log('[Better Auth] GET Passkey route:', url.pathname);
		}
		
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
		
		// Debug logging for passkey routes
		if (process.env.NODE_ENV === 'development' && url.pathname.includes('passkey')) {
			console.log('[Better Auth] Passkey route detected:', url.pathname);
		}

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
		// Read body as text first to avoid consuming the stream
		let requestToPass = request;
		let bodyText: string | null = null;

		if (url.pathname.includes('/sign-in/email')) {
			try {
				// Read body as text (this consumes the stream, so we need to reconstruct)
				bodyText = await request.text();
				const body = JSON.parse(bodyText);
				const { email } = body;

				if (email) {
					// Check user role before allowing sign-in
					const { prisma } = await import('@/lib/db');
					const user = await prisma.user.findUnique({
						where: { email },
						select: {
							id: true,
							email: true,
							role: true,
							isActive: true,
						},
					});

					if (user) {
						// Prevent subscribers from logging in
						if (user.role === 'SUBSCRIBER' || !user.role) {
							return NextResponse.json(
								{
									error: 'Access denied',
									message:
										'Subscribers cannot log in. Please contact an administrator.',
								},
								{ status: 403 }
							);
						}

						// Check if user is active
						if (user.isActive === false) {
							return NextResponse.json(
								{
									error: 'Account deactivated',
									message:
										'Your account has been deactivated. Please contact an administrator.',
								},
								{ status: 403 }
							);
						}
					}
				}

				// Reconstruct the request with the body text for better-auth
				requestToPass = new NextRequest(request.url, {
					method: request.method,
					headers: request.headers,
					body: bodyText,
				});
			} catch (checkError) {
				// If we can't check, let better-auth handle it (will fail at password check anyway)
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						'[Better Auth] Could not pre-check user role:',
						checkError
					);
				}
				// If body reading/parsing failed, try to reconstruct with original body text
				if (bodyText) {
					try {
						requestToPass = new NextRequest(request.url, {
							method: request.method,
							headers: request.headers,
							body: bodyText,
						});
					} catch {
						// If reconstruction fails, return error
						return NextResponse.json(
							{
								error: 'Invalid request',
								message:
									'Could not process authentication request',
							},
							{ status: 400 }
						);
					}
				} else {
					// If we couldn't read body at all, return error
					return NextResponse.json(
						{
							error: 'Invalid request',
							message: 'Request body is required',
						},
						{ status: 400 }
					);
				}
			}
		}

		// Debug logging before calling handler
		if (url.pathname.includes('passkey')) {
			const requestOrigin = request.headers.get('origin') || request.headers.get('referer')?.split('/').slice(0, 3).join('/');
			console.log('[Better Auth] Passkey request:', {
				pathname: url.pathname,
				method: requestToPass.method,
				url: requestToPass.url,
				requestOrigin,
				host: url.host,
			});
		}
		
		const result = await handler.POST(requestToPass);
		
		// Debug logging after handler call
		if (process.env.NODE_ENV === 'development' && url.pathname.includes('passkey')) {
			console.log('[Better Auth] Handler response status:', result instanceof Response ? result.status : 'not a Response');
			if (result instanceof Response && result.status === 404) {
				console.error('[Better Auth] 404 for passkey route - handler may not recognize this route');
				// Try to read the response body for more info
				try {
					const cloned = result.clone();
					const text = await cloned.text();
					console.error('[Better Auth] 404 response body:', text);
				} catch (e) {
					console.error('[Better Auth] Could not read 404 response body');
				}
			}
		}

		// Handle signout - better-auth handles cookie clearing automatically
		// We only need to ensure the response is properly formatted for Next.js
		// Better-auth uses /api/auth/signout (no hyphen)
		if (url.pathname.includes('/signout')) {
			// Better-auth automatically clears cookies via Set-Cookie headers
			// We just need to ensure the response is a proper NextResponse
			if (result instanceof Response) {
				// Convert to NextResponse to preserve all headers (including Set-Cookie)
				const nextResponse = new NextResponse(result.body, {
					status: result.status,
					statusText: result.statusText,
					headers: result.headers,
				});
				
				// Log in development for debugging
				if (process.env.NODE_ENV === 'development') {
					console.log('[Better Auth] Signout response:', {
						status: result.status,
						hasSetCookie: result.headers.has('set-cookie'),
					});
				}
				
				return nextResponse;
			}
			
			// If result is not a Response, return it as-is (shouldn't happen)
			return result;
		}

		// After sign-in attempt, verify the user is not a subscriber (if successful)
		// Only check if status is 200 (successful sign-in)
		// IMPORTANT: We must preserve the original response and its Set-Cookie headers
		if (
			url.pathname.includes('/sign-in/email') &&
			result.status === 200
		) {
			// Convert result to NextResponse to preserve headers properly
			let nextResponse: NextResponse;

			try {
				// Clone to read without consuming the original
				const clonedResult = result.clone();
				const resultData = await clonedResult.json();

				// Debug logging in development
				if (process.env.NODE_ENV === 'development') {
					console.log(
						'[Better Auth] Sign-in response data:',
						resultData
					);
					console.log(
						'[Better Auth] Response headers:',
						Object.fromEntries(result.headers.entries())
					);
				}

				// Check if user data exists in response
				// Better-auth might return user data directly or in a nested structure
				const user =
					resultData.user ||
					resultData.data?.user ||
					resultData;

				// Only check role if we have user data with an id or email
				if (user && (user.id || user.email)) {
					// Get the user's role from database to verify (better-auth response might not include it)
					const { prisma } = await import('@/lib/db');
					const whereClause = user.id
						? { id: user.id }
						: user.email
						? { email: user.email }
						: null;

					const dbUser = whereClause
						? await prisma.user.findUnique({
								where: whereClause,
								select: {
									id: true,
									role: true,
									isActive: true,
								},
						  })
						: null;

					// Double-check: if somehow a subscriber got through, revoke the session
					if (
						dbUser &&
						(dbUser.role === 'SUBSCRIBER' || !dbUser.role)
					) {
						if (process.env.NODE_ENV === 'development') {
							console.warn(
								'[Better Auth] Subscriber attempted login, revoking session'
							);
						}
						// Revoke any session that might have been created
						const { auth } = await import(
							'@/lib/better-auth'
						);
						const sessionCookie =
							request.cookies.get(
								'better-auth.session_token'
							)?.value ||
							request.cookies.get(
								'better-auth.sessionToken'
							)?.value ||
							request.cookies.get(
								'__Secure-better-auth.session_token'
							)?.value;

						if (sessionCookie) {
							try {
								await auth.api.signOut({
									headers: request.headers,
								});
							} catch (signOutError) {
								if (
									process.env.NODE_ENV === 'development'
								) {
									console.error(
										'[Better Auth] Error revoking subscriber session:',
										signOutError
									);
								}
							}
						}

						return NextResponse.json(
							{
								error: 'Access denied',
								message:
									'Subscribers cannot log in. Please contact an administrator.',
							},
							{ status: 403 }
						);
					}
				}

				// Create NextResponse with the parsed body
				nextResponse = NextResponse.json(resultData, {
					status: result.status,
				});
			} catch (verifyError) {
				// If we can't parse the response, try to preserve it as-is
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						'[Better Auth] Could not verify post-sign-in role:',
						verifyError
					);
				}

				// Try to get the body
				const cloned = result.clone();
				let responseBody = null;
				try {
					responseBody = await cloned.json();
				} catch {
					try {
						responseBody = await cloned.text();
					} catch {
						responseBody = null;
					}
				}

				nextResponse =
					responseBody !== null
						? typeof responseBody === 'string'
							? NextResponse.json(
									{ message: responseBody },
									{ status: result.status }
							  )
							: NextResponse.json(responseBody, {
									status: result.status,
							  })
						: new NextResponse(result.body, {
								status: result.status,
						  });
			}

			// CRITICAL: Copy all headers from the original response
			// This includes Set-Cookie headers that set the session token
			if (result instanceof Response) {
				let setCookieCount = 0;
				result.headers.forEach((value, key) => {
					// Append Set-Cookie headers (there can be multiple)
					if (key.toLowerCase() === 'set-cookie') {
						nextResponse.headers.append(key, value);
						setCookieCount++;
						if (process.env.NODE_ENV === 'development') {
							console.log(`[Better Auth] Setting cookie ${setCookieCount}:`, value.substring(0, 100) + '...');
						}
					} else {
						nextResponse.headers.set(key, value);
					}
				});
				
				if (process.env.NODE_ENV === 'development') {
					console.log(`[Better Auth] Sign-in response: ${setCookieCount} Set-Cookie header(s) copied`);
				}
			}

			return nextResponse;
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

		// If 404, log more details for debugging (especially for passkey routes)
		if (result.status === 404) {
			if (process.env.NODE_ENV === 'development') {
				console.error('[Better Auth] 404 error for path:', url.pathname);
				console.error('[Better Auth] Handler returned 404 - route may not be registered');
				if (url.pathname.includes('passkey')) {
					console.error('[Better Auth] Passkey route not found - check if passkey plugin is properly configured');
				}
			}
		}

		// If error status, ensure we have a proper error response
		if (result.status >= 400) {
			// Clone to read without consuming the original
			const cloned = result.clone();
			try {
				const text = await cloned.text();

				// Log origin-related errors for debugging
				if (text && (text.includes('invalid origin') || text.includes('Invalid origin') || text.includes('INVALID_ORIGIN'))) {
					const requestOrigin = request.headers.get('origin') || request.headers.get('referer')?.split('/').slice(0, 3).join('/');
					console.error('[Better Auth] Invalid origin error:', {
						requestOrigin,
						configuredOrigin: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL,
						url: url.toString(),
						host: url.host,
						errorText: text,
					});
				}

				// If the response body is empty, create a proper error response
				if (!text || text.trim() === '') {
					return NextResponse.json(
						{
							error: 'Authentication failed',
						},
						{ status: result.status }
					);
				}

				// If response has content, try to parse it and return it
				try {
					const errorData = JSON.parse(text);
					return NextResponse.json(errorData, {
						status: result.status,
					});
				} catch {
					// If not JSON, return the text as error message
					return NextResponse.json(
						{
							error: text || 'Authentication failed',
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

		// Return the successful response as-is
		// For passkey routes, ensure we preserve all headers
		if (url.pathname.includes('passkey') && result instanceof Response) {
			if (process.env.NODE_ENV === 'development') {
				console.log('[Better Auth] Passkey route response status:', result.status);
				console.log('[Better Auth] Passkey route response headers:', Object.fromEntries(result.headers.entries()));
			}
		}
		
		return result;
	} catch (error) {
		// Log error details only in development
		if (process.env.NODE_ENV === 'development') {
			console.error('Better Auth POST Error:', error);
			if (error instanceof Error) {
				console.error('Error stack:', error.stack);
			}
		}

		return NextResponse.json(
			{
				error: 'Internal server error',
			},
			{ status: 500 }
		);
	}
}
