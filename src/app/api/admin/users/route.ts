import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-new';
import { hasPermission } from '@/lib/rbac';
import { validatePasswordStrength } from '@/lib/validation/password';
import type { UserRole } from '@/types';

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
	try {
		// Authentication check
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		// Permission check
		if (!hasPermission(user.role, 'read:users')) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}

		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				isActive: true,
				avatar: true,
				bio: true,
				website: true,
				image: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						posts: true,
						comments: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		return NextResponse.json({ users });
	} catch (error) {
		console.error('Error fetching users:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch users' },
			{ status: 500 }
		);
	}
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
	try {
		// Authentication check
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		// Permission check
		if (!hasPermission(user.role, 'write:users')) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}

		const {
			email,
			password,
			name,
			role,
			isActive = true,
		} = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Email and password are required' },
				{ status: 400 }
			);
		}

		// Validate password strength
		const passwordValidation = validatePasswordStrength(password);
		if (!passwordValidation.valid) {
			return NextResponse.json(
				{
					error: 'Password does not meet security requirements',
					details: passwordValidation.errors,
				},
				{ status: 400 }
			);
		}

		// Validate role
		const validRoles: UserRole[] = [
			'ADMIN',
			'DEVELOPER',
			'SUBSCRIBER',
		];
		if (role && !validRoles.includes(role)) {
			return NextResponse.json(
				{ error: 'Invalid role specified' },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: 'User with this email already exists' },
				{ status: 409 }
			);
		}

		// Use better-auth's password hashing function
		const { auth } = await import('@/lib/better-auth');
		const ctx = await auth.$context;
		const hashedPassword = await ctx.password.hash(password);
		
		// Create user
		const newUser = await prisma.user.create({
			data: {
				name: name || email.split('@')[0],
				email,
				emailVerified: false,
				role: role || 'SUBSCRIBER',
				isActive: isActive !== false,
			},
		});

        // Create account with password
        await prisma.account.create({
          data: {
            id: `acc_${newUser.id}`,
            accountId: newUser.id,
            providerId: 'credential', // better-auth uses 'credential' for email/password auth
            userId: newUser.id,
            password: hashedPassword,
          },
        });

		return NextResponse.json({
			message: 'User created successfully',
			user: {
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
				role: (newUser.role as UserRole) || 'SUBSCRIBER',
				isActive: newUser.isActive,
			},
		});
	} catch (error) {
		console.error('Error creating user:', error);
		return NextResponse.json(
			{ error: 'Failed to create user' },
			{ status: 500 }
		);
	}
}
