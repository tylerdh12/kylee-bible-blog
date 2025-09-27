import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/database'
import { validateProductionEnv } from '@/lib/env-validation'

export async function GET() {
  try {
    // Validate environment configuration
    const envValid = validateProductionEnv()

    const db = DatabaseService.getInstance()

    // Test database and get basic stats
    const [postsCount, goalsCount, donationsCount] = await Promise.all([
      db.findPosts().then(posts => posts.length),
      db.findGoals().then(goals => goals.length),
      db.findDonations().then(donations => donations.length)
    ])

    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected',
        posts: postsCount,
        goals: goalsCount,
        donations: donationsCount
      },
      configuration: {
        environment: envValid ? 'valid' : 'invalid',
        nextauth: !!process.env.NEXTAUTH_SECRET,
        jwt: !!process.env.JWT_SECRET,
        database: !!process.env.DATABASE_URL
      },
      routes: {
        api: '/api',
        health: '/api/health',
        auth: '/api/auth',
        posts: '/api/posts',
        goals: '/api/goals',
        donations: '/api/donations'
      }
    })
  } catch (error) {
    console.error('Status check failed:', error)

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV
      },
      { status: 500 }
    )
  }
}