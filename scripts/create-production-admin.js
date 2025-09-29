#!/usr/bin/env node

/**
 * Production admin creation script
 * Creates an admin user directly in the database for production deployment
 */

const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')

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

    if (existingUser) {
      console.log(`⚠️  User ${email} already exists`)
      
      if (!existingUser.password) {
        // Set password for existing user
        const hashedPassword = await bcryptjs.hash(password, 12)
        await prisma.user.update({
          where: { email },
          data: { 
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true
          }
        })
        console.log('✅ Password set for existing user and promoted to admin')
      } else {
        // Update password and ensure admin role
        const hashedPassword = await bcryptjs.hash(password, 12)
        await prisma.user.update({
          where: { email },
          data: { 
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true
          }
        })
        console.log('✅ Password updated and admin role confirmed')
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcryptjs.hash(password, 12)
      
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN',
          isActive: true
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