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
    const publishedPosts = dbStorage.posts.filter(p => p.published).length
    const totalGoals = dbStorage.goals.length
    const activeGoals = dbStorage.goals.filter(g => !g.completed).length
    const totalDonations = dbStorage.donations.length
    const totalDonationAmount = dbStorage.donations.reduce((sum, d) => sum + d.amount, 0)

    return NextResponse.json({
      totalPosts,
      publishedPosts,
      totalGoals,
      activeGoals,
      totalDonations,
      totalDonationAmount
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}