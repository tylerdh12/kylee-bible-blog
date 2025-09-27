import { useCallback } from 'react'

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  customMessage?: string
}

export function useErrorHandler() {
  const handleError = useCallback(
    (error: Error, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        logError = true,
        customMessage = 'An unexpected error occurred',
      } = options

      if (logError) {
        console.error('Error handled:', error)
      }

      if (showToast) {
        const message = error.message || customMessage
        console.warn('Error toast:', message)
      }
    },
    []
  )

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options: ErrorHandlerOptions = {}
    ): Promise<T | null> => {
      try {
        return await asyncFn()
      } catch (error) {
        handleError(error instanceof Error ? error : new Error(String(error)), options)
        return null
      }
    },
    [handleError]
  )

  return {
    handleError,
    handleAsyncError,
  }
}