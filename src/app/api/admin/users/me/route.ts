import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET - Get current user profile
export async function GET(request: NextRequest) {
	try {
		const user = await getSessionUser();
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
		const user = await getSessionUser();
		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { name, bio, website, avatar, currentPassword, newPassword } =
			body;

		// If changing password, verify current password
		if (newPassword) {
			if (!currentPassword) {
				return NextResponse.json(
					{ error: 'Current password is required to set a new password' },
					{ status: 400 }
				);
			}

			const userWithPassword = await prisma.user.findUnique({
				where: { id: user.id },
			});

			if (!userWithPassword?.password) {
				return NextResponse.json(
					{ error: 'No password set for this account' },
					{ status: 400 }
				);
			}

			const isPasswordValid = await bcrypt.compare(
				currentPassword,
				userWithPassword.password
			);

			if (!isPasswordValid) {
				return NextResponse.json(
					{ error: 'Current password is incorrect' },
					{ status: 401 }
				);
			}
		}

		// Update user profile
		const updateData: any = {};
		if (name !== undefined) updateData.name = name;
		if (bio !== undefined) updateData.bio = bio;
		if (website !== undefined) updateData.website = website;
		if (avatar !== undefined) updateData.avatar = avatar;
		if (newPassword) {
			updateData.password = await bcrypt.hash(newPassword, 10);
		}

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
