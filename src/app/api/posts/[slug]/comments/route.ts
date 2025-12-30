import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth-new'
import { hasPermission } from '@/lib/rbac'
import { sanitizeUserInput } from '@/lib/utils/sanitize'

interface RouteParams {
  params: Promise<{ slug: string }>
}

// GET - Get comments for a post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if comments are enabled
    const { isFeatureEnabled } = await import('@/lib/settings');
    const enabled = await isFeatureEnabled('comments');
    if (!enabled) {
      return NextResponse.json(
        { comments: [], message: 'Comments are currently disabled' },
        { status: 200 }
      );
    }

    const { slug } = await params

    // Find the post
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const user = await getAuthenticatedUser()
    const canModerate = user && hasPermission(user.role, 'moderate:comments')

    // Get top-level comments with their replies
    const comments = await prisma.comment.findMany({
      where: {
        postId: post.id,
        parentId: null,
        ...(canModerate ? {} : { isApproved: true }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        replies: {
          where: canModerate ? {} : { isApproved: true },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if comments are enabled
    const { isFeatureEnabled } = await import('@/lib/settings');
    const enabled = await isFeatureEnabled('comments');
    if (!enabled) {
      return NextResponse.json(
        { error: 'Comments are currently disabled' },
        { status: 403 }
      );
    }

    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!hasPermission(user.role, 'write:comments')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { slug } = await params
    const { content, parentId } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Sanitize comment content to prevent XSS (async on server)
    const sanitizedContent = await sanitizeUserInput(content);

    // Find the post
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // If parentId is provided, verify the parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })

      if (!parentComment || parentComment.postId !== post.id) {
        return NextResponse.json(
          { error: 'Invalid parent comment' },
          { status: 400 }
        )
      }
    }

    // Create the comment
    // Auto-approve for admins and developers, require moderation for subscribers
    const isApproved = hasPermission(user.role, 'moderate:comments')

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        authorId: user.id,
        postId: post.id,
        parentId: parentId || null,
        isApproved,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: isApproved
        ? 'Comment posted successfully'
        : 'Comment submitted for moderation',
      comment,
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}