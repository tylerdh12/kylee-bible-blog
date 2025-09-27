import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { DatabaseService } from "@/lib/services/database"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Blog Posts - Kylee's Bible Study Journey",
  description: "Explore all blog posts from Kylee's Bible study journey. Discover in-depth biblical insights, spiritual reflections, and practical applications of God's word for daily life.",
  keywords: ["Bible study", "Christian blog", "spiritual growth", "biblical insights", "faith journey", "Scripture study"],
  openGraph: {
    title: "All Blog Posts - Kylee's Bible Study Journey",
    description: "Explore all blog posts from Kylee's Bible study journey. Discover in-depth biblical insights, spiritual reflections, and practical applications of God's word.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Blog Posts - Kylee's Bible Study Journey",
    description: "Explore all blog posts from Kylee's Bible study journey. Discover in-depth biblical insights and spiritual reflections.",
  },
}

async function getPosts() {
  const db = DatabaseService.getInstance()
  return db.findPosts({
    published: true,
    includeAuthor: true,
    includeTags: true,
    sort: { field: 'publishedAt', order: 'desc' }
  })
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            All Blog Posts
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore all posts from Kylee's Bible study journey and spiritual insights
          </p>
        </div>

        {posts.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                📖
              </div>
              <h3 className="text-xl font-semibold mb-2">No posts published yet</h3>
              <p className="text-muted-foreground mb-6">
                Check back soon for new content from Kylee's Bible study journey!
              </p>
              <Link href="/" className="text-primary hover:underline font-medium">
                ← Back to Home
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.map((post: any) => (
                <Card key={post.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>📅</span>
                      {post.publishedAt && format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                      {post.author?.name && (
                        <>
                          <span>•</span>
                          <span>By {post.author.name}</span>
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt || post.content.substring(0, 150) + '...'}
                    </p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag: any) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Link
                      href={`/posts/${post.slug}`}
                      className="inline-flex items-center text-primary hover:underline font-medium group-hover:text-primary/80 transition-colors"
                    >
                      Read full post
                      <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}