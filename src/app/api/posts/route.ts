import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import slugify from 'slugify'

export async function POST(request: NextRequest) {
  try {
    const { title, content, excerpt, published, tags } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // For now, we'll use a hardcoded user ID. In production, you'd get this from authentication
    const authorId = await getOrCreateDefaultUser()

    const slug = slugify(title, { lower: true, strict: true })
    
    // Handle tags
    const tagConnections = await Promise.all(
      tags.map(async (tagName: string) => {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        })
        return { id: tag.id }
      })
    )

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        published,
        publishedAt: published ? new Date() : null,
        authorId,
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        author: { select: { name: true, email: true } },
        tags: true,
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getOrCreateDefaultUser() {
  let user = await prisma.user.findFirst()
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'kylee@example.com',
        password: '$2b$12$dummyhash', // This should be properly hashed in production
        name: 'Kylee',
        role: 'admin',
      },
    })
  }
  
  return user.id
}