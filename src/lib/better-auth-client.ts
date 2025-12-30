/**
 * Better Auth Client for Client Components
 *
 * This provides the better-auth client instance for use in React components
 */

'use client';

import { createAuthClient } from 'better-auth/react';
import { passkeyClient } from '@better-auth/passkey/client';

export const authClient = createAuthClient({
	baseURL:
		process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
		(typeof window !== 'undefined'
			? window.location.origin
			: 'http://localhost:3000'),
	plugins: [passkeyClient()],
});

export const { useSession, signIn, signOut } = authClient;
