"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { format } from "date-fns"
import Link from "next/link"
import { BookOpen, Heart, Target, Calendar, ArrowRight, Plus } from "lucide-react"
import type { Post, Goal, Donation } from "@/types"

interface DashboardData {
  recentPosts: Post[]
  activeGoals: Goal[]
  recentDonations: Donation[]
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData>({
    recentPosts: [],
    activeGoals: [],
    recentDonations: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [postsRes, goalsRes, donationsRes] = await Promise.all([
          fetch('/api/posts?take=5'),
          fetch('/api/goals?completed=false&take=3'),
          fetch('/api/donations?take=5')
        ])

        const [posts, goals, donations] = await Promise.all([
          postsRes.json(),
          goalsRes.json(),
          donationsRes.json()
        ])

        setData({
          recentPosts: posts.posts || [],
          activeGoals: goals.goals || [],
          recentDonations: donations.donations || []
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Posts
              </CardTitle>
              <CardDescription>Latest blog posts and their status</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/posts">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No posts created yet</p>
                <Button asChild size="sm">
                  <Link href="/admin/posts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/posts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Goals
              </CardTitle>
              <CardDescription>Current fundraising goals progress</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/goals">
                Manage <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.activeGoals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No active goals</p>
                <Button asChild size="sm">
                  <Link href="/admin/goals/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.activeGoals.map((goal) => (
                  <div key={goal.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge variant="outline">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                      </Badge>
                    </div>
                    <ProgressBar
                      current={goal.currentAmount}
                      target={goal.targetAmount}
                      className="text-xs"
                    />
                    {goal.deadline && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Deadline: {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/goals/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Goal
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Recent Donations
            </CardTitle>
            <CardDescription>Latest donations and supporter messages</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/donations">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {data.recentDonations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No donations received yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Share your donation page to start receiving support
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${donation.amount.toFixed(2)}
                      </span>
                      {donation.anonymous ? (
                        <Badge variant="secondary">Anonymous</Badge>
                      ) : (
                        donation.donorName && (
                          <span className="text-sm text-muted-foreground">
                            from {donation.donorName}
                          </span>
                        )
                      )}
                    </div>
                    {donation.message && (
                      <p className="text-sm text-muted-foreground truncate italic">
                        "{donation.message}"
                      </p>
                    )}
                    {donation.goal && (
                      <p className="text-xs text-muted-foreground">
                        For: {donation.goal.title}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(donation.createdAt), 'MMM dd')}
                    </p>
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