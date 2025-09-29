import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/database'
import type { PostsResponse } from '@/types'

const db = DatabaseService.getInstance()

export async function GET() {
  try {
    // Add a timeout to prevent hanging
    const posts = await Promise.race([
      db.findPosts({
        published: true,
        includeAuthor: true,
        includeTags: true,
        sort: { field: 'publishedAt', order: 'desc' },
        take: 6,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ])

    const response: PostsResponse = { posts: posts as any }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching public posts:', error)
    // Return empty array instead of error to allow graceful fallback
    return NextResponse.json({ posts: [] })
  }
}