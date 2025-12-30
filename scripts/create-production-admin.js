#!/usr/bin/env node

/**
 * Production admin creation script
 * Creates an admin user directly in the database for production deployment
 */

const { PrismaClient } = require('@prisma/client')
const { betterAuth } = require('better-auth')
const { prismaAdapter } = require('better-auth/adapters/prisma')

async function createProductionAdmin() {
  const prisma = new PrismaClient()

  try {
    console.log('🔧 Creating production admin user...')

    // Get environment variables or use defaults
    const email = process.env.ADMIN_EMAIL || 'kylee@blog.com'
    const password = process.env.ADMIN_PASSWORD
    const name = process.env.ADMIN_NAME || 'Kylee Champion'

    if (!password) {
      console.error('❌ ADMIN_PASSWORD environment variable is required')
      console.log('Usage: ADMIN_PASSWORD="your-secure-password" node scripts/create-production-admin.js')
      process.exit(1)
    }

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters long')
      process.exit(1)
    }

    // Test database connection
    console.log('🔍 Testing database connection...')
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    // Use better-auth's password hashing function
    const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const authSecret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || ''
    
    const tempAuth = betterAuth({
      database: prismaAdapter(prisma, { provider: 'postgresql' }),
      secret: authSecret,
      baseURL: baseURL,
      emailAndPassword: {
        enabled: true,
        password: {
          hash: async (password) => {
            const bcryptjs = require('bcryptjs')
            return await bcryptjs.hash(password, 12)
          },
          verify: async ({ hash, password }) => {
            const bcryptjs = require('bcryptjs')
            return await bcryptjs.compare(password, hash)
          },
        },
      },
    })

    const ctx = await tempAuth.$context
    const hashedPassword = await ctx.password.hash(password)

    if (existingUser) {
      console.log(`⚠️  User ${email} already exists`)
      
      // Update user role
      await prisma.user.update({
        where: { email },
        data: { 
          role: 'ADMIN',
          isActive: true
        }
      })

      // Check if account exists
      const account = await prisma.account.findFirst({
        where: { userId: existingUser.id, providerId: 'credential' }
      })

      if (account) {
        // Update existing account password
        await prisma.account.update({
          where: { id: account.id },
          data: { password: hashedPassword }
        })
        console.log('✅ Password updated and admin role confirmed')
      } else {
        // Create account with password
        await prisma.account.create({
          data: {
            id: `acc_${existingUser.id}`,
            accountId: existingUser.id,
            providerId: 'credential',
            userId: existingUser.id,
            password: hashedPassword,
          }
        })
        console.log('✅ Password set for existing user and promoted to admin')
      }
    } else {
      // Create new admin user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'ADMIN',
          isActive: true
        }
      })

      // Create account with password (better-auth stores passwords in Account model)
      await prisma.account.create({
        data: {
          id: `acc_${user.id}`,
          accountId: user.id,
          providerId: 'credential',
          userId: user.id,
          password: hashedPassword,
        }
      })
      console.log('✅ New admin user created successfully')
    }

    console.log(`
📋 Admin User Details:
  Email: ${email}
  Name: ${name}
  Role: ADMIN
  Status: Active

🚀 You can now log in to the admin panel at /admin
`)

  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  createProductionAdmin()
}

module.exports = { createProductionAdmin }