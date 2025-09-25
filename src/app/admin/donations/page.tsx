"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"

interface Donation {
  id: string
  amount: number
  donorName?: string
  message?: string
  anonymous: boolean
  createdAt: string
  goalId?: string
  goal?: {
    id: string
    title: string
  }
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      // For now, we'll create a simple donations endpoint
      const response = await fetch('/api/admin/donations')
      if (response.ok) {
        const data = await response.json()
        setDonations(data.donations || [])
      }
    } catch (error) {
      console.error('Error fetching donations:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading donations...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Donations</h1>
        <Link href="/admin">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Summary Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Donation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">${totalDonations.toFixed(2)}</p>
              <p className="text-muted-foreground">Total Donations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{donations.length}</p>
              <p className="text-muted-foreground">Number of Donations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                ${donations.length > 0 ? (totalDonations / donations.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-muted-foreground">Average Donation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No donations received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-600">
                          ${donation.amount.toFixed(2)}
                        </span>
                        {donation.anonymous ? (
                          <Badge variant="secondary">Anonymous</Badge>
                        ) : (
                          donation.donorName && (
                            <span className="text-muted-foreground">
                              from {donation.donorName}
                            </span>
                          )
                        )}
                      </div>
                      
                      {donation.goal && (
                        <div>
                          <Badge variant="outline">
                            Goal: {donation.goal.title}
                          </Badge>
                        </div>
                      )}
                      
                      {donation.message && (
                        <p className="text-sm text-muted-foreground italic">
                          "{donation.message}"
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      {format(new Date(donation.createdAt), 'PPp')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}