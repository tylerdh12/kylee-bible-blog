"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Heart, Target, TrendingUp, TrendingDown, Users, FileText, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"

interface StatsData {
  totalPosts: number
  publishedPosts: number
  totalGoals: number
  activeGoals: number
  totalDonations: number
  totalDonationAmount: number
}

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  badge?: string
}

function StatCard({ title, value, description, icon: Icon, trend, badge }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>

        <div className="flex items-center justify-between mt-4">
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}

          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalPosts: 0,
    publishedPosts: 0,
    totalGoals: 0,
    activeGoals: 0,
    totalDonations: 0,
    totalDonationAmount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const publishedPercentage = stats.totalPosts > 0
    ? Math.round((stats.publishedPosts / stats.totalPosts) * 100)
    : 0

  const activeGoalsPercentage = stats.totalGoals > 0
    ? Math.round((stats.activeGoals / stats.totalGoals) * 100)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Posts"
        value={stats.totalPosts}
        description="All blog posts created"
        icon={FileText}
        trend={{
          value: 12,
          isPositive: true
        }}
        badge="Content"
      />

      <StatCard
        title="Published Posts"
        value={stats.publishedPosts}
        description={`${publishedPercentage}% of all posts`}
        icon={BookOpen}
        trend={{
          value: 8,
          isPositive: true
        }}
        badge="Live"
      />

      <StatCard
        title="Active Goals"
        value={stats.activeGoals}
        description={`${stats.totalGoals} total goals created`}
        icon={Target}
        trend={{
          value: activeGoalsPercentage > 50 ? 5 : -2,
          isPositive: activeGoalsPercentage > 50
        }}
        badge="Fundraising"
      />

      <StatCard
        title="Total Donations"
        value={`$${stats.totalDonationAmount.toFixed(2)}`}
        description={`From ${stats.totalDonations} donations`}
        icon={Heart}
        trend={{
          value: 15,
          isPositive: true
        }}
        badge="Support"
      />

      <StatCard
        title="Avg. Donation"
        value={`$${stats.totalDonations > 0 ? (stats.totalDonationAmount / stats.totalDonations).toFixed(2) : '0.00'}`}
        description="Average donation amount"
        icon={DollarSign}
        trend={{
          value: 3,
          isPositive: true
        }}
      />

      <StatCard
        title="Community"
        value="Growing"
        description="Blog readership and engagement"
        icon={Users}
        trend={{
          value: 25,
          isPositive: true
        }}
        badge="Engagement"
      />
    </div>
  )
}