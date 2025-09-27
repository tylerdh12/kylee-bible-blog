/**
 * Environment variable validation for production deployment
 */

export function validateProductionEnv() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('Missing required environment variables:', missing)
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Validate JWT_SECRET length for security
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('JWT_SECRET should be at least 32 characters long for security')
  }

  // Validate NEXTAUTH_SECRET length
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn('NEXTAUTH_SECRET should be at least 32 characters long for security')
  }

  // Validate DATABASE_URL format for production
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith('file:')) {
      console.warn('Using SQLite in production. Consider using PostgreSQL for better performance.')
    }
  }

  return true
}

// Export environment configuration
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const