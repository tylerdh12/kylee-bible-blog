#!/usr/bin/env node

/**
 * Deployment verification script
 * Tests all critical API endpoints and database connectivity
 */

const { PrismaClient } = require('@prisma/client')

async function verifyDeployment() {
  console.log('🚀 Starting deployment verification...\n')

  let exitCode = 0

  // Test 1: Environment Variables
  console.log('1. Checking environment variables...')
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET']
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '))
    exitCode = 1
  } else {
    console.log('✅ All required environment variables present')
  }

  // Test 2: Database Connection
  console.log('\n2. Testing database connection...')
  const prisma = new PrismaClient()

  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')

    // Test basic operations
    const postsCount = await prisma.post.count()
    const goalsCount = await prisma.goal.count()
    const donationsCount = await prisma.donation.count()

    console.log(`   📊 Database stats: ${postsCount} posts, ${goalsCount} goals, ${donationsCount} donations`)
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    exitCode = 1
  } finally {
    await prisma.$disconnect()
  }

  // Test 3: API Routes (if server is running)
  if (process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL) {
    console.log('\n3. Testing API routes...')
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const routes = ['/api/health', '/api/status', '/api/goals', '/api/donations']

    for (const route of routes) {
      try {
        const response = await fetch(`${baseUrl}${route}`)
        if (response.ok) {
          console.log(`✅ ${route} - ${response.status}`)
        } else {
          console.error(`❌ ${route} - ${response.status} ${response.statusText}`)
          exitCode = 1
        }
      } catch (error) {
        console.error(`❌ ${route} - ${error.message}`)
        // Don't fail on network errors in build environment
        if (!process.env.VERCEL) {
          exitCode = 1
        }
      }
    }
  } else {
    console.log('\n3. Skipping API route tests (no server URL available)')
  }

  // Test 4: Build Artifacts
  console.log('\n4. Checking build artifacts...')
  const fs = require('fs')
  const path = require('path')

  const criticalFiles = [
    '.next/BUILD_ID',
    '.next/static',
    'package.json',
    'next.config.ts'
  ]

  for (const file of criticalFiles) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`✅ ${file} exists`)
    } else {
      console.error(`❌ ${file} missing`)
      exitCode = 1
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  if (exitCode === 0) {
    console.log('🎉 Deployment verification PASSED!')
    console.log('🚀 Application is ready for production')
  } else {
    console.log('💥 Deployment verification FAILED!')
    console.log('🔧 Please fix the issues above before deploying')
  }
  console.log('='.repeat(50))

  process.exit(exitCode)
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Verification interrupted')
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️  Verification terminated')
  process.exit(1)
})

// Run verification
verifyDeployment().catch((error) => {
  console.error('💥 Verification script failed:', error)
  process.exit(1)
})