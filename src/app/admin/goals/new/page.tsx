"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"

export default function NewGoalPage() {
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
      })
      const data = await response.json()
      if (data.authenticated) {
        setUser(data.user)
      } else {
        window.location.href = '/admin'
      }
    } catch {
      window.location.href = '/admin'
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
      alert('Title and valid target amount are required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          targetAmount: parseFloat(targetAmount),
          deadline: deadline || null
        }),
      })

      if (response.ok) {
        alert('Goal created successfully!')
        // Reset form
        setTitle("")
        setDescription("")
        setTargetAmount("")
        setDeadline("")
      } else {
        alert('Failed to create goal')
      }
    } catch {
      alert('Error creating goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout
      user={user}
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Goals', href: '/admin/goals' },
        { label: 'New Goal' },
      ]}
      title='Create New Goal'
      description='Set up a new ministry fundraising goal'
    >
      <Card>
        <CardHeader>
          <CardTitle>Set Ministry Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Bible Study Materials Fund"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this goal will help accomplish..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount * ($)</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="500.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </Button>
            <Link href="/admin/goals">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}