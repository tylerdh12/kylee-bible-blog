import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ArrowLeft, Search } from 'lucide-react'

export default function AdminPostNotFound() {
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Post Not Found</CardTitle>
          <CardDescription>
            The post you're trying to edit doesn't exist or you don't have permission to access it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This could happen if the post was deleted, the ID was incorrect,
            or you don't have the necessary permissions.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link href="/admin/posts">
                <Search className="mr-2 h-4 w-4" />
                View All Posts
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}