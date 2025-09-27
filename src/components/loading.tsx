import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('flex items-center justify-center gap-2 text-muted-foreground', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  )
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="rounded-md bg-muted h-4 w-3/4 mb-2"></div>
      <div className="rounded-md bg-muted h-4 w-1/2 mb-4"></div>
      <div className="rounded-md bg-muted h-20 w-full"></div>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" text="Loading..." />
      </div>
    </div>
  )
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6">
          <LoadingCard />
        </div>
      ))}
    </div>
  )
}