"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"

interface Goal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  completed: boolean
  createdAt: string
  donations: Array<{
    id: string
    amount: number
  }>
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/admin/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals || [])
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading goals...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Goals</h1>
        <div className="flex gap-2">
          <Link href="/admin/goals/new">
            <Button>Create New Goal</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">No goals created yet.</p>
              <Link href="/admin/goals/new" className="mt-4 inline-block">
                <Button>Create Your First Goal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => {
            const progressPercentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {goal.title}
                        {goal.completed && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Completed
                          </Badge>
                        )}
                      </CardTitle>
                      {goal.description && (
                        <p className="text-muted-foreground mt-2">{goal.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {progressPercentage.toFixed(1)}% complete
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${goal.completed ? 'bg-green-600' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div>
                        <span>Created: {format(new Date(goal.createdAt), 'MMM dd, yyyy')}</span>
                        {goal.deadline && (
                          <span className="ml-4">
                            Deadline: {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                      <div>
                        {goal.donations.length} donation{goal.donations.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}