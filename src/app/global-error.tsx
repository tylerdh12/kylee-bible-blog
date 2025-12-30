'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error boundary caught:', error)
    }
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border rounded-lg shadow-lg p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Application Error
              </h1>
              <p className="text-sm text-muted-foreground">
                A critical error occurred and the application needs to be restarted.
                This issue has been logged automatically.
              </p>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left text-sm">
                <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.digest && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Digest:</strong> {error.digest}
                    </div>
                  )}
                  {error.stack && (
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Restart Application
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}