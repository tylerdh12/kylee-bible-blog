import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { DatabaseService } from "@/lib/services/database"
import Link from "next/link"

async function getPost(slug: string) {
  const db = DatabaseService.getInstance()
  const post = await db.findPostBySlug(slug, true)
  return post
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>→</span>
            <Link href="/posts" className="hover:text-foreground transition-colors">Posts</Link>
            <span>→</span>
            <span className="text-foreground">{post.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Author & Date Info */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6 pb-6 border-b">
              {post.author?.name && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {post.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>By {post.author.name}</span>
                </div>
              )}
              {post.publishedAt && (
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Published {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag: any) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="mb-16">
            <div
              className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Call-to-Action Section */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-semibold mb-3">
              💝 Was this post helpful?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If this post blessed you or helped in your spiritual journey, consider supporting Kylee's ministry and Bible study goals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/goals"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:scale-105"
              >
                <span className="mr-2">🎯</span>
                View Ministry Goals
              </a>
              <a
                href="/donate"
                className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105"
              >
                <span className="mr-2">💖</span>
                Make a Donation
              </a>
            </div>
          </div>
        </div>

        {/* Back to Posts */}
        <div className="text-center mt-8">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Posts
          </Link>
        </div>
      </div>
    </div>
  )
}