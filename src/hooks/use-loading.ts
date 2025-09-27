import { useState, useCallback } from 'react'

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = useCallback(() => setIsLoading(true), [])
  const stopLoading = useCallback(() => setIsLoading(false), [])

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      setIsLoading(true)
      try {
        const result = await asyncFn()
        return result
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  }
}