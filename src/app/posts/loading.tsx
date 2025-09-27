import { LoadingGrid } from '@/components/loading'

export default function PostsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse mb-8">
        <div className="h-8 bg-muted rounded w-48 mb-4"></div>
        <div className="h-4 bg-muted rounded w-96"></div>
      </div>
      <LoadingGrid count={9} />
    </div>
  )
}