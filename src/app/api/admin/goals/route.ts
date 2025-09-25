import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { title, description, targetAmount, deadline } = await request.json()

    if (!title || !targetAmount || targetAmount <= 0) {
      return NextResponse.json(
        { error: 'Title and valid target amount are required' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description: description || null,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        deadline: deadline ? new Date(deadline) : null,
        completed: false,
      },
    })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        donations: true,
      },
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' },
      ],
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