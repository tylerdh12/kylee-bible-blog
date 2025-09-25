import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { mockDb } from '@/lib/mock-db'

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const donations = await mockDb.donation.findMany({
      include: { goal: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ donations })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}