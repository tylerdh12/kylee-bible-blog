import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

/**
 * In-memory store for rate limiting.
 *
 * IMPORTANT: This in-memory approach has limitations in serverless environments (Vercel):
 * - Each function invocation may have fresh memory, so rate limits may not persist
 * - For production apps with high traffic, consider using:
 *   - Vercel KV (Redis-compatible)
 *   - Upstash Redis
 *   - External rate limiting service
 *
 * The current implementation still provides some protection against rapid-fire requests
 * within the same function instance, which handles most casual abuse cases.
 */
const rateLimitStore = new Map<string, RateLimitEntry>()

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): { success: boolean; limit: number; remaining: number; resetTime: number } => {
    const ip = getClientIP(request)
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    // Clean up expired entries
    cleanupExpiredEntries(now)

    const entry = rateLimitStore.get(key)

    if (!entry) {
      // First request from this IP for this endpoint
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })

      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs
      }
    }

    if (now > entry.resetTime) {
      // Window has expired, reset counter
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })

      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs
      }
    }

    if (entry.count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment counter
    entry.count++
    rateLimitStore.set(key, entry)

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

function getClientIP(request: NextRequest): string {
  // Try various headers to get the real client IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback to a default IP if none found
  return '127.0.0.1'
}

function cleanupExpiredEntries(now: number) {
  // Clean up expired entries every 100 requests (simple cleanup strategy)
  if (Math.random() < 0.01) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  donations: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  posts: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
  goals: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 requests per minute
  strict: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 requests per minute for sensitive endpoints
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 requests per hour per IP
}