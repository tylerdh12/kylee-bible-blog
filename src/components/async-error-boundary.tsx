'use client'

import { ReactNode, useEffect, useState } from 'react'
import { ErrorBoundary } from './error-boundary'

interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export function AsyncErrorBoundary({ children, fallback }: AsyncErrorBoundaryProps) {
  const [asyncError, setAsyncError] = useState<Error | null>(null)

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)

      if (event.reason instanceof Error) {
        setAsyncError(event.reason)
      } else {
        setAsyncError(new Error(String(event.reason)))
      }

      event.preventDefault()
    }

    const handleError = (event: ErrorEvent) => {
      console.error('Global error event:', event.error)
      setAsyncError(event.error)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  if (asyncError) {
    if (fallback) {
      const FallbackComponent = fallback
      return (
        <FallbackComponent
          error={asyncError}
          reset={() => setAsyncError(null)}
        />
      )
    }

    throw asyncError
  }

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
}