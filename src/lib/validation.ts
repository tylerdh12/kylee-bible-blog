import { z } from 'zod'

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

// Goal schemas
export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  targetAmount: z.number().positive('Target amount must be greater than 0').max(1000000, 'Target amount is too large'),
  deadline: z.string().datetime().optional().or(z.literal(''))
})

export const goalUpdateSchema = goalSchema.partial()

// Donation schemas
export const donationSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0').max(100000, 'Amount is too large'),
  donorName: z.string().max(100, 'Donor name must be 100 characters or less').optional(),
  message: z.string().max(500, 'Message must be 500 characters or less').optional(),
  anonymous: z.boolean().default(false),
  goalId: z.string().optional()
})

// Post schemas
export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt must be 500 characters or less').optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([])
})

export const postUpdateSchema = postSchema.partial()

// Tag schema
export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be 50 characters or less')
})

// Validation helper function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true
  data: T
} | {
  success: false
  errors: string[]
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => err.message)
      }
    }
    return {
      success: false,
      errors: ['Invalid data format']
    }
  }
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a proper HTML sanitizer like DOMPurify
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// Rate limiting - use the dedicated rate-limit.ts module instead
// Note: In-memory rate limiting has limitations in serverless environments (Vercel)
// as each function invocation may have fresh memory. Consider using Redis or
// Vercel KV for production rate limiting across function instances.
export { rateLimit, rateLimitConfigs } from './utils/rate-limit'

// Error handling
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors: string[] = []) {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

// Global error handler for API routes
export function handleApiError(error: unknown): {
  message: string
  status: number
  errors?: string[]
} {
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error)
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      status: error.statusCode,
      errors: error.errors
    }
  }

  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.statusCode
    }
  }

  if (error instanceof z.ZodError) {
    return {
      message: 'Validation failed',
      status: 400,
      errors: error.issues.map(err => err.message)
    }
  }

  return {
    message: 'Internal server error',
    status: 500
  }
}

// Input sanitization middleware
export function sanitizeRequestBody(body: any): any {
  if (typeof body === 'string') {
    return sanitizeString(body)
  }

  if (Array.isArray(body)) {
    return body.map(sanitizeRequestBody)
  }

  if (body && typeof body === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(body)) {
      sanitized[key] = sanitizeRequestBody(value)
    }
    return sanitized
  }

  return body
}