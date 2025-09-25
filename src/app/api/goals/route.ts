import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      where: { completed: false },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}