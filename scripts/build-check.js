#!/usr/bin/env node

/**
 * Pre-build validation script for Vercel
 * Checks for common deployment issues before building
 */

console.log('🔍 Running pre-build validation...')

// Check Node.js version
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])

if (majorVersion < 18) {
  console.error(`❌ Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`)
  process.exit(1)
}

console.log(`✅ Node.js version ${nodeVersion} is supported`)

// Check package.json
const fs = require('fs')
const path = require('path')

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))

  // Check for required dependencies
  const requiredDeps = [
    '@prisma/client',
    'next',
    'react',
    'react-dom'
  ]

  const missing = requiredDeps.filter(dep =>
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  )

  if (missing.length > 0) {
    console.error(`❌ Missing required dependencies: ${missing.join(', ')}`)
    process.exit(1)
  }

  console.log('✅ All required dependencies present')
} catch (error) {
  console.error('❌ Failed to read package.json:', error.message)
  process.exit(1)
}

// Check for Prisma schema
if (!fs.existsSync(path.join(process.cwd(), 'prisma', 'schema.prisma'))) {
  console.error('❌ Prisma schema not found at prisma/schema.prisma')
  process.exit(1)
}

console.log('✅ Prisma schema found')

// Check for Next.js config
const nextConfigExists = fs.existsSync(path.join(process.cwd(), 'next.config.ts')) ||
                         fs.existsSync(path.join(process.cwd(), 'next.config.js'))

if (!nextConfigExists) {
  console.warn('⚠️  No Next.js config file found')
} else {
  console.log('✅ Next.js config found')
}

// Environment check for build
if (process.env.NODE_ENV === 'production') {
  console.log('🔧 Production build mode detected')

  // Check if DATABASE_URL or POSTGRES_PRISMA_URL is set (should be present in production)
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_PRISMA_URL && !process.env.SKIP_ENV_VALIDATION) {
    console.warn('⚠️  No database URL set. Build may succeed but runtime will fail.')
    console.warn('⚠️  Set DATABASE_URL or POSTGRES_PRISMA_URL in Vercel environment variables.')
  }
} else {
  console.log('🔧 Development/build mode detected')
}

console.log('✅ Pre-build validation completed successfully!')
console.log('🚀 Proceeding with build...\n')