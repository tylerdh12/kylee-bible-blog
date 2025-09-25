import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { dbStorage } from '@/lib/mock-db'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totalPosts = dbStorage.posts.length
    const activeGoals = dbStorage.goals.filter(g => !g.completed).length
    const totalDonations = dbStorage.donations.reduce((sum, d) => sum + d.amount, 0)

    // Calculate this month's donations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyDonations = dbStorage.donations
      .filter(d => d.createdAt >= startOfMonth)
      .reduce((sum, d) => sum + d.amount, 0)

    return NextResponse.json({
      stats: {
        totalPosts,
        activeGoals,
        totalDonations,
        monthlyDonations
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}