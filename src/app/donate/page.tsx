"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSearchParams } from "next/navigation"

interface Goal {
  id: string
  title: string
  description?: string
  currentAmount: number
  targetAmount: number
}

function DonateForm() {
  const searchParams = useSearchParams()
  const goalId = searchParams.get('goal')
  
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<string>("general")
  const [amount, setAmount] = useState("")
  const [donorName, setDonorName] = useState("")
  const [message, setMessage] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGoals()
    if (goalId) {
      setSelectedGoal(goalId)
    }
  }, [goalId])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      const data = await response.json()
      setGoals(data.goals || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          donorName: anonymous ? null : donorName,
          message,
          anonymous,
          goalId: selectedGoal === "general" ? null : selectedGoal,
        }),
      })

      if (response.ok) {
        alert('Thank you for your donation! 🙏')
        // Reset form
        setAmount("")
        setDonorName("")
        setMessage("")
        setSelectedGoal("general")
      } else {
        alert('Failed to process donation. Please try again.')
      }
    } catch {
      alert('Error processing donation')
    } finally {
      setLoading(false)
    }
  }

  const selectedGoalData = selectedGoal !== "general" ? goals.find(goal => goal.id === selectedGoal) : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Support Kylee&apos;s Ministry</h1>
        <p className="text-xl text-muted-foreground">
          Your generosity helps further Bible study resources, ministry outreach, 
          and spreading God&apos;s love in our community.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Make a Donation</CardTitle>
          <CardDescription>
            Choose to support a specific goal or make a general donation to support the ministry.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleDonate} className="space-y-6">
            {goals.length > 0 && (
              <div className="space-y-2">
                <Label>Support a Specific Goal (Optional)</Label>
                <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a goal or leave blank for general donation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Donation</SelectItem>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedGoalData && (
                  <Card className="mt-4">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{selectedGoalData.title}</h4>
                        <Badge variant="outline">
                          ${selectedGoalData.currentAmount} / ${selectedGoalData.targetAmount}
                        </Badge>
                      </div>
                      {selectedGoalData.description && (
                        <p className="text-sm text-muted-foreground">
                          {selectedGoalData.description}
                        </p>
                      )}
                      <div className="w-full bg-secondary rounded-full h-2 mt-3">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((selectedGoalData.currentAmount / selectedGoalData.targetAmount) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Donation Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                <Label htmlFor="anonymous">Make this donation anonymous</Label>
              </div>
            </div>

            {!anonymous && (
              <div className="space-y-2">
                <Label htmlFor="donorName">Your Name (Optional)</Label>
                <Input
                  id="donorName"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your name to be recognized"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave an encouraging message..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : `Donate $${amount || '0.00'}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-2">Thank You for Your Support!</h3>
          <p className="text-sm text-muted-foreground">
            Your donation helps Kylee continue her Bible study ministry, create valuable content, 
            and reach more people with God&apos;s word. Every contribution, no matter the size, 
            makes a meaningful difference.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DonatePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
      <DonateForm />
    </Suspense>
  )
}