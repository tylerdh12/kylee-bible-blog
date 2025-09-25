import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

async function getPost(slug: string) {
  const post = await prisma.post.findFirst({
    where: { 
      slug,
      published: true 
    },
    include: {
      author: { select: { name: true } },
      tags: true,
    },
  })

  return post
}

interface PageProps {
  params: { slug: string }
}

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
            {post.author?.name && (
              <span>By {post.author.name}</span>
            )}
            {post.publishedAt && (
              <span>Published {format(new Date(post.publishedAt), 'PPPP')}</span>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: any) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <div className="mt-12 pt-8 border-t">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Did this post bless you? Consider supporting Kylee's ministry.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/goals"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              View Ministry Goals
            </a>
            <a
              href="/donate"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Make a Donation
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}