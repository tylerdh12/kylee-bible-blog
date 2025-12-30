import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-new';
import { hasPermission } from '@/lib/rbac';
import type { UserRole } from '@/types';

interface RouteParams {
	params: Promise<{ id: string }>;
}

// GET - Get specific user
export async function GET(
	request: NextRequest,
	{ params }: RouteParams
) {
	try {
		// Authentication check
		const currentUser = await getAuthenticatedUser();
		if (!currentUser) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		// Permission check
		if (!hasPermission(currentUser.role, 'read:users')) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}

		const { id } = await params;

		const targetUser = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				isActive: true,
				avatar: true,
				bio: true,
				website: true,
				createdAt: true,
				updatedAt: true,
				posts: {
					select: {
						id: true,
						title: true,
						slug: true,
						published: true,
						createdAt: true,
					},
					orderBy: { createdAt: 'desc' },
				},
				comments: {
					select: {
						id: true,
						content: true,
						isApproved: true,
						createdAt: true,
						post: {
							select: {
								id: true,
								title: true,
								slug: true,
							},
						},
					},
					orderBy: { createdAt: 'desc' },
				},
			},
		});

		if (!targetUser) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ user: targetUser });
	} catch (error) {
		console.error('Error fetching user:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch user' },
			{ status: 500 }
		);
	}
}

// PATCH - Update user
export async function PATCH(
	request: NextRequest,
	{ params }: RouteParams
) {
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

		const { id } = await params;
		const {
			email,
			password,
			name,
			role,
			isActive,
			avatar,
			bio,
			website,
		} = await request.json();

		// Validate role if provided
		if (role) {
			const validRoles: UserRole[] = [
				'ADMIN',
				'DEVELOPER',
				'SUBSCRIBER',
			];
			if (!validRoles.includes(role)) {
				return NextResponse.json(
					{ error: 'Invalid role specified' },
					{ status: 400 }
				);
			}
		}

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		// If email is being changed, check it's not taken
		if (email && email !== existingUser.email) {
			const emailTaken = await prisma.user.findUnique({
				where: { email },
			});

			if (emailTaken) {
				return NextResponse.json(
					{ error: 'Email already in use' },
					{ status: 409 }
				);
			}
		}

		// Update user (password goes to Account table, not User)
		const updateData: any = {
			...(email && { email }),
			...(name !== undefined && { name }),
			...(role && { role }),
			...(isActive !== undefined && { isActive }),
			...(avatar !== undefined && { avatar }),
			...(bio !== undefined && { bio }),
			...(website !== undefined && { website }),
		};

		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				isActive: true,
				avatar: true,
				bio: true,
				website: true,
				updatedAt: true,
			},
		});

		// Update password using bcryptjs (same as better-auth uses internally)
		if (password) {
			try {
				// Use better-auth's password hashing function
				const { auth } = await import('@/lib/better-auth');
				const ctx = await auth.$context;
				const hashedPassword = await ctx.password.hash(password);
				
				const account = await prisma.account.findFirst({
					where: { userId: id, providerId: 'credential' },
				});

				if (account) {
					await prisma.account.update({
						where: { id: account.id },
						data: { password: hashedPassword },
					});
				} else {
					// Create account if it doesn't exist
					await prisma.account.create({
						data: {
							id: `acc_${id}`,
							accountId: id,
							providerId: 'credential',
							userId: id,
							password: hashedPassword,
						},
					});
				}
			} catch (passwordError) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Error updating password:', passwordError);
				}
				return NextResponse.json(
					{ error: 'Failed to update password' },
					{ status: 500 }
				);
			}
		}

		return NextResponse.json({
			message: 'User updated successfully',
			user: updatedUser,
		});
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error updating user:', error);
		}
		return NextResponse.json(
			{ error: 'Failed to update user' },
			{ status: 500 }
		);
	}
}

// DELETE - Delete user
export async function DELETE(
	request: NextRequest,
	{ params }: RouteParams
) {
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
		if (!hasPermission(user.role, 'delete:users')) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}

		const { id } = await params;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		// Prevent deleting the last admin
		if (existingUser.role === 'ADMIN') {
			const adminCount = await prisma.user.count({
				where: { role: 'ADMIN' },
			});

			if (adminCount <= 1) {
				return NextResponse.json(
					{ error: 'Cannot delete the last admin user' },
					{ status: 400 }
				);
			}
		}

		await prisma.user.delete({
			where: { id },
		});

		return NextResponse.json({
			message: 'User deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting user:', error);
		return NextResponse.json(
			{ error: 'Failed to delete user' },
			{ status: 500 }
		);
	}
}
