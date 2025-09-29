import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermissions } from '@/lib/rbac'
import bcryptjs from 'bcryptjs'
import type { UserRole } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get specific user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requirePermissions('read:users')(request)
    if (authCheck instanceof NextResponse) return authCheck

    const { id } = await params

    const user = await prisma.user.findUnique({
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
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH - Update user
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requirePermissions('write:users')(request)
    if (authCheck instanceof NextResponse) return authCheck

    const { id } = await params
    const { email, password, name, role, isActive, avatar, bio, website } = await request.json()

    // Validate role if provided
    if (role) {
      const validRoles: UserRole[] = ['ADMIN', 'DEVELOPER', 'SUBSCRIBER']
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role specified' },
          { status: 400 }
        )
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If email is being changed, check it's not taken
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        )
      }
    }

    // Hash password if provided
    let hashedPassword
    if (password) {
      hashedPassword = await bcryptjs.hash(password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(name !== undefined && { name }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(avatar !== undefined && { avatar }),
        ...(bio !== undefined && { bio }),
        ...(website !== undefined && { website }),
      },
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
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requirePermissions('delete:users')(request)
    if (authCheck instanceof NextResponse) return authCheck

    const { id } = await params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deleting the last admin
    if (existingUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        )
      }
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}