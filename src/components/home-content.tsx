'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import type { Post, Goal } from '@/types'

export function HomeContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Load data from API endpoints with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

        try {
          const [postsRes, goalsRes] = await Promise.allSettled([
            fetch('/api/public/posts', {
              signal: controller.signal,
              cache: 'no-store'
            }),
            fetch('/api/public/goals', {
              signal: controller.signal,
              cache: 'no-store'
            })
          ])

          clearTimeout(timeoutId)

          // Handle posts response
          if (postsRes.status === 'fulfilled' && postsRes.value.ok) {
            const postsData = await postsRes.value.json()
            setPosts(postsData.posts || [])
          } else {
            console.log('Posts API not available, using fallback')
            setPosts([])
          }

          // Handle goals response
          if (goalsRes.status === 'fulfilled' && goalsRes.value.ok) {
            const goalsData = await goalsRes.value.json()
            setGoals(goalsData.goals || [])
          } else {
            console.log('Goals API not available, using fallback')
            setGoals([])
          }

        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            console.log('Request timed out, using fallback content')
          } else {
            console.log('API request failed, using fallback content')
          }
          setPosts([])
          setGoals([])
        }

      } catch (err) {
        console.error('Failed to load content:', err)
        setError('Unable to load content')
        setPosts([])
        setGoals([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-12">
        {/* Posts Loading */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold">Recent Posts</h2>
            <Link href="/posts" className="text-primary hover:underline">
              View all posts →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Goals Loading */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold">Current Goals</h2>
            <Link href="/goals" className="text-primary hover:underline">
              View all goals →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-2 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Recent Posts Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Recent Posts</h2>
          <Link href="/posts" className="text-primary hover:underline">
            View all posts →
          </Link>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Welcome to Kylee's Bible Blog!</p>
              <p className="text-sm text-muted-foreground">
                Posts are loading or will be available soon.
                In the meantime, explore other sections of the site or check out the admin setup.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription>
                    {post.publishedAt && format(new Date(post.publishedAt), 'PPP')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-primary hover:underline font-medium"
                  >
                    Read more →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Goals Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Current Goals</h2>
          <Link href="/goals" className="text-primary hover:underline">
            View all goals →
          </Link>
        </div>

        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Goals will be available soon!</p>
              <p className="text-sm text-muted-foreground">
                Ministry goals and donation tracking are being set up.
                Visit the admin panel to configure goals once the system is ready.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{goal.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {goal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>${goal.currentAmount.toFixed(2)}</span>
                        <span>${goal.targetAmount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        {progress.toFixed(1)}% completed
                      </p>
                    </div>
                    <Link
                      href={`/donate?goal=${goal.id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      Support this goal →
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}