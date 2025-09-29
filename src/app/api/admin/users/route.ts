import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermissions } from '@/lib/rbac'
import { createUser } from '@/lib/auth'
import type { UserRole } from '@/types'

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requirePermissions('read:users')(request)
    if (authCheck instanceof NextResponse) return authCheck

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
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requirePermissions('write:users')(request)
    if (authCheck instanceof NextResponse) return authCheck

    const { email, password, name, role, isActive = true } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: UserRole[] = ['ADMIN', 'DEVELOPER', 'SUBSCRIBER']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const user = await createUser(email, password, name, role || 'SUBSCRIBER')

    // Update isActive if specified
    if (isActive !== true) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive },
      })
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}