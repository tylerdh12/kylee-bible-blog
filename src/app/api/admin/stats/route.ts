import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { DatabaseService } from '@/lib/services/database'
import type { StatsResponse, ApiResponse } from '@/types'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'Unauthorized'
      }
      return NextResponse.json(errorResponse, { status: 401 })
    }

    const db = DatabaseService.getInstance()

    // Get all data
    const [allPosts, allGoals, allDonations] = await Promise.all([
      db.findPosts({ includeAuthor: false, includeTags: false }),
      db.findGoals({ includeDonations: false }),
      db.findDonations({ includeGoal: false })
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
      totalDonationAmount
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