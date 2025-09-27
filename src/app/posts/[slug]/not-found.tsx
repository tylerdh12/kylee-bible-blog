import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Search, Home } from 'lucide-react'

export default function PostNotFound() {
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Post Not Found</CardTitle>
          <CardDescription>
            The blog post you're looking for doesn't exist or may have been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This could happen if the post was deleted, the URL was mistyped,
            or you followed an outdated link.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link href="/posts">
                <Search className="mr-2 h-4 w-4" />
                Browse All Posts
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}