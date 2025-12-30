import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-new';

// GET - Get current user profile
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const userProfile = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				avatar: true,
				bio: true,
				website: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						posts: true,
						comments: true,
					},
				},
			},
		});

		if (!userProfile) {
			return NextResponse.json(
				{ error: 'User not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			user: {
				...userProfile,
				postsCount: userProfile._count.posts,
				commentsCount: userProfile._count.comments,
			},
		});
	} catch (error) {
		console.error('Error fetching user profile:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch user profile' },
			{ status: 500 }
		);
	}
}

// PATCH - Update current user profile
export async function PATCH(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { name, email, bio, website, avatar, currentPassword, newPassword } =
			body;

		// If changing password, use better-auth's internal password utilities
		if (newPassword) {
			if (!currentPassword) {
				return NextResponse.json(
					{ error: 'Current password is required to set a new password' },
					{ status: 400 }
				);
			}

			try {
				// Get the account to verify current password
				const account = await prisma.account.findFirst({
					where: {
						userId: user.id,
						providerId: 'credential',
					},
				});

				if (!account || !account.password) {
					return NextResponse.json(
						{ error: 'No password set for this account' },
						{ status: 400 }
					);
				}

				// Verify current password using better-auth's password verification
				const { auth } = await import('@/lib/better-auth');
				const ctx = await auth.$context;
				const isPasswordValid = await ctx.password.verify({
					hash: account.password,
					password: currentPassword,
				});

				if (!isPasswordValid) {
					return NextResponse.json(
						{ error: 'Current password is incorrect' },
						{ status: 401 }
					);
				}

				// Hash new password using better-auth's password hashing
				const hashedPassword = await ctx.password.hash(newPassword);

				// Update the account password
				await prisma.account.update({
					where: { id: account.id },
					data: { password: hashedPassword },
				});
			} catch (passwordError: any) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Error changing password:', passwordError);
				}
				return NextResponse.json(
					{ error: 'Failed to change password. Please verify your current password.' },
					{ status: 500 }
				);
			}
		}

		// Email validation if provided
		if (email !== undefined) {
			if (!email.trim()) {
				return NextResponse.json(
					{ error: 'Email is required' },
					{ status: 400 }
				);
			}

			if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
				return NextResponse.json(
					{ error: 'Invalid email address' },
					{ status: 400 }
				);
			}

			// Check if email is already in use by another user
			const existingUser = await prisma.user.findFirst({
				where: {
					email: email,
					NOT: { id: user.id }
				}
			});

			if (existingUser) {
				return NextResponse.json(
					{ error: 'Email is already in use by another account' },
					{ status: 400 }
				);
			}
		}

		// Update user profile
		const updateData: any = {};
		if (name !== undefined) updateData.name = name;
		if (email !== undefined) updateData.email = email;
		if (bio !== undefined) updateData.bio = bio;
		if (website !== undefined) updateData.website = website;
		if (avatar !== undefined) updateData.avatar = avatar;

		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				avatar: true,
				bio: true,
				website: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						posts: true,
						comments: true,
					},
				},
			},
		});

		// Password change is handled above using better-auth's API
		// No need to manually update the password here

		return NextResponse.json({
			message: 'Profile updated successfully',
			user: {
				...updatedUser,
				postsCount: updatedUser._count.posts,
				commentsCount: updatedUser._count.comments,
			},
		});
	} catch (error) {
		console.error('Error updating user profile:', error);
		return NextResponse.json(
			{ error: 'Failed to update user profile' },
			{ status: 500 }
		);
	}
}
