import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from './auth-new';
import type { UserRole } from '@/types';

// Define permissions for each role
export const PERMISSIONS = {
	ADMIN: [
		'read:posts',
		'write:posts',
		'delete:posts',
		'read:users',
		'write:users',
		'delete:users',
		'read:comments',
		'write:comments',
		'delete:comments',
		'moderate:comments',
		'read:goals',
		'write:goals',
		'delete:goals',
		'read:donations',
		'write:donations',
		'read:analytics',
		'admin:settings',
		'read:content',
		'write:content',
	],
	DEVELOPER: [
		'read:posts',
		'write:posts',
		'delete:posts',
		'read:users',
		'read:comments',
		'write:comments',
		'moderate:comments',
		'read:goals',
		'write:goals',
		'read:donations',
		'read:analytics',
		'read:content',
		'write:content',
	],
	SUBSCRIBER: [
		'read:posts',
		'write:comments',
		'read:goals',
		'write:donations',
	],
} as const;

export type Permission =
	(typeof PERMISSIONS)[keyof typeof PERMISSIONS][number];

export function hasPermission(
	userRole: UserRole,
	permission: Permission
): boolean {
	return (
		PERMISSIONS[userRole] as readonly Permission[]
	).includes(permission);
}

export function requireAuth(permissions?: Permission[]) {
	return async function middleware() {
		const user = await getAuthenticatedUser();

		if (!user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		if (!user.isActive) {
			return NextResponse.json(
				{ error: 'Account is inactive' },
				{ status: 403 }
			);
		}

		if (permissions) {
			const hasAllPermissions = permissions.every(
				(permission) => hasPermission(user.role, permission)
			);

			if (!hasAllPermissions) {
				return NextResponse.json(
					{ error: 'Insufficient permissions' },
					{ status: 403 }
				);
			}
		}

		// Add user to request for use in route handlers
		return NextResponse.next({
			headers: {
				'x-user-id': user.id,
				'x-user-role': user.role,
			},
		});
	};
}

// Route handler version - returns error response or null (for use in route handlers, not middleware)
export async function requirePermissionsRouteHandler(
	...permissions: Permission[]
): Promise<NextResponse | null> {
	const user = await getAuthenticatedUser();

	if (!user) {
		return NextResponse.json(
			{ error: 'Authentication required' },
			{ status: 401 }
		);
	}

	if (!user.isActive) {
		return NextResponse.json(
			{ error: 'Account is inactive' },
			{ status: 403 }
		);
	}

	if (permissions.length > 0) {
		const hasAllPermissions = permissions.every(
			(permission) => hasPermission(user.role, permission)
		);

		if (!hasAllPermissions) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}
	}

	return null; // No error, user is authorized
}

// Middleware version - for use in middleware only
export function requirePermissions(
	...permissions: Permission[]
) {
	return requireAuth(permissions);
}

export function requireRole(...roles: UserRole[]) {
	return async function middleware() {
		const user = await getAuthenticatedUser();

		if (!user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		if (!user.isActive) {
			return NextResponse.json(
				{ error: 'Account is inactive' },
				{ status: 403 }
			);
		}

		if (!roles.includes(user.role)) {
			return NextResponse.json(
				{ error: 'Insufficient role permissions' },
				{ status: 403 }
			);
		}

		return NextResponse.next({
			headers: {
				'x-user-id': user.id,
				'x-user-role': user.role,
			},
		});
	};
}

/**
 * Require ADMIN role - use this for all admin routes
 * This ensures only ADMIN users can access admin functionality
 */
export async function requireAdmin() {
	const user = await getAuthenticatedUser();

	if (!user) {
		return {
			error: NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			),
			user: null,
		};
	}

	if (!user.isActive) {
		return {
			error: NextResponse.json(
				{ error: 'Account is inactive' },
				{ status: 403 }
			),
			user: null,
		};
	}

	if (user.role !== 'ADMIN') {
		return {
			error: NextResponse.json(
				{ error: 'Admin access required' },
				{ status: 403 }
			),
			user: null,
		};
	}

	return { error: null, user };
}

// Helper to get user from request headers (set by middleware)
export function getUserFromRequest(request: NextRequest) {
	return {
		id: request.headers.get('x-user-id'),
		role: request.headers.get(
			'x-user-role'
		) as UserRole | null,
	};
}
