import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { amount, donorName, message, anonymous, goalId } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      )
    }

    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        donorName: anonymous ? null : donorName,
        message,
        anonymous,
        goalId: goalId || null,
      },
    })

    // If donation is for a specific goal, update the goal's current amount
    if (goalId) {
      await prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: {
            increment: parseFloat(amount)
          }
        }
      })

      // Check if goal is now completed
      const updatedGoal = await prisma.goal.findUnique({
        where: { id: goalId }
      })

      if (updatedGoal && updatedGoal.currentAmount >= updatedGoal.targetAmount) {
        await prisma.goal.update({
          where: { id: goalId },
          data: { completed: true }
        })
      }
    }

    return NextResponse.json({ donation }, { status: 201 })
  } catch (error) {
    console.error('Error creating donation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}