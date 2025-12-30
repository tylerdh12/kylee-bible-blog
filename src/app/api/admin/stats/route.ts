import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/rbac'
import { DatabaseService } from '@/lib/services/database'
import { prisma } from '@/lib/db'
import type { StatsResponse, ApiResponse } from '@/types'

export async function GET() {
  try {
    // Require ADMIN role for admin stats
    const { error, user } = await requireAdmin()
    if (error) {
      return error
    }
    if (!user) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Unauthorized'
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    const db = DatabaseService.getInstance()

    // Get all data
    const [
      allPosts,
      allGoals,
      allDonations,
      commentsCount,
      subscribersCount,
      prayerRequestsCount
    ] = await Promise.all([
      db.findPosts({ includeAuthor: false, includeTags: false }),
      db.findGoals({ includeDonations: false }),
      db.findDonations({ includeGoal: false }),
      prisma.comment.count(),
      prisma.subscriber.count({ where: { status: 'active' } }),
      prisma.prayerRequest.count()
    ])

    const totalPosts = allPosts.length
    const publishedPosts = allPosts.filter(p => p.published).length
    const totalGoals = allGoals.length
    const activeGoals = allGoals.filter(g => !g.completed).length
    const totalDonations = allDonations.length
    const totalDonationAmount = allDonations.reduce((sum, d) => sum + d.amount, 0)

    const response: StatsResponse = {
      totalPosts,
      publishedPosts,
      totalGoals,
      activeGoals,
      totalDonations,
      totalDonationAmount,
      totalComments: commentsCount,
      totalSubscribers: subscribersCount,
      totalPrayerRequests: prayerRequestsCount
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching stats:', error)
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Internal server error'
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}