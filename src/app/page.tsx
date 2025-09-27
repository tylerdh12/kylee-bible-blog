import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kylee's Bible Blog - Bible Study Journey & Christian Insights",
  description: "Join Kylee's Bible study journey. Discover in-depth biblical insights, spiritual reflections, and practical applications of God's word. Support ministry goals and grow in faith together.",
  keywords: ["Bible study", "Christian blog", "biblical insights", "faith journey", "Scripture study", "spiritual growth", "ministry", "Christian community"],
  openGraph: {
    title: "Kylee's Bible Blog - Bible Study Journey & Christian Insights",
    description: "Join Kylee's Bible study journey. Discover in-depth biblical insights, spiritual reflections, and practical applications of God's word.",
    type: "website",
    locale: "en_US",
    siteName: "Kylee's Bible Blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kylee's Bible Blog - Bible Study Journey & Christian Insights",
    description: "Join Kylee's Bible study journey. Discover biblical insights and spiritual reflections.",
  },
  alternates: {
    canonical: "/",
  },
}

async function getRecentPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      author: { select: { name: true } },
      tags: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  })
}

async function getActiveGoals() {
  return prisma.goal.findMany({
    where: { completed: false },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
}

export default async function Home() {
  const [posts, goals] = await Promise.all([
    getRecentPosts(),
    getActiveGoals(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Kylee's Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join me on my Bible study journey as I explore God&apos;s word, share insights, 
          and grow in faith. Together, we can support ministry goals and build community.
        </p>
      </div>

      {/* Recent Posts Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Recent Posts</h2>
          <Link href="/posts" className="text-primary hover:underline">
            View all posts →
          </Link>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No posts yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
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
                    {post.tags.map((tag: any) => (
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
              <p className="text-muted-foreground">No active goals at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((goal: any) => {
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