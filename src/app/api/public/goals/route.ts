import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/database'
import type { GoalsResponse } from '@/types'

const db = DatabaseService.getInstance()

export async function GET() {
  try {
    // Add a timeout to prevent hanging
    const goals = await Promise.race([
      db.findGoals({
        completed: false,
        sort: { field: 'createdAt', order: 'desc' },
        take: 3,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ])

    const response: GoalsResponse = { goals: goals as any }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching public goals:', error)
    // Return empty array instead of error to allow graceful fallback
    return NextResponse.json({ goals: [] })
  }
}