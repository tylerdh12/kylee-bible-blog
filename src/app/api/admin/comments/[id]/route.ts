import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermissions } from '@/lib/rbac'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH - Approve/reject or edit comment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requirePermissions('moderate:comments')(request)
    if (authCheck instanceof NextResponse) return authCheck

    const { id } = await params
    const { isApproved, content } = await request.json()

    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        ...(isApproved !== undefined && { isApproved }),
        ...(content && { content }),
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
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// DELETE - Delete comment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authCheck = await requirePermissions('delete:comments')(request)
    if (authCheck instanceof NextResponse) return authCheck

    const { id } = await params

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        replies: true,
      },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Delete comment and all its replies (cascade will handle this)
    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Comment deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}