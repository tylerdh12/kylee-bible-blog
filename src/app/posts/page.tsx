import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"

async function getPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      author: { select: { name: true } },
      tags: true,
    },
    orderBy: { publishedAt: 'desc' },
  })
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">All Blog Posts</h1>
        <p className="text-xl text-muted-foreground">
          Explore all posts from Kylee's Bible study journey
        </p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No posts published yet.</p>
            <p className="text-sm text-muted-foreground">Check back soon for new content!</p>
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
  )
}