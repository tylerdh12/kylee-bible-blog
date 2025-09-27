import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function createProductionAdmin() {
  try {
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'kylee@blog.com'
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_NAME || 'Kylee'

    if (!adminPassword) {
      console.error('❌ ADMIN_PASSWORD environment variable is required for production setup')
      console.log('Please set ADMIN_PASSWORD environment variable with a secure password')
      process.exit(1)
    }

    if (adminPassword.length < 8) {
      console.error('❌ ADMIN_PASSWORD must be at least 8 characters long')
      process.exit(1)
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log(`ℹ️  Admin user with email ${adminEmail} already exists!`)

      // Update password if different
      const passwordMatch = await bcryptjs.compare(adminPassword, existingAdmin.password)
      if (!passwordMatch) {
        const hashedPassword = await bcryptjs.hash(adminPassword, 12)
        await prisma.user.update({
          where: { email: adminEmail },
          data: { password: hashedPassword }
        })
        console.log('🔑 Admin password updated successfully!')
      }
      return
    }

    // Create new admin user
    const hashedPassword = await bcryptjs.hash(adminPassword, 12)

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'admin',
      },
    })

    console.log('✅ Production admin user created successfully!')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`👤 Name: ${adminName}`)
    console.log('🔐 Password: [SECURE - from environment variable]')
    console.log('')
    console.log('🚀 You can now login to the admin panel at /admin')

  } catch (error) {
    console.error('❌ Error creating production admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createProductionAdmin()