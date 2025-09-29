import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function verifyAdmin() {
  try {
    console.log('🔍 Checking admin user in database...')

    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'kylee@blog.com' }
    })

    if (!adminUser) {
      console.log('❌ Admin user not found in database!')
      console.log('Available users:')
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      })
      console.table(allUsers)
      return
    }

    console.log('✅ Admin user found!')
    console.log('📧 Email:', adminUser.email)
    console.log('👤 Name:', adminUser.name)
    console.log('🔑 Role:', adminUser.role)
    console.log('✅ Active:', adminUser.isActive)
    console.log('📅 Created:', adminUser.createdAt)
    console.log('🔐 Has Password:', !!adminUser.password)

    // Test password verification
    if (adminUser.password) {
      const testPassword = 'KyleeBlog2024!'
      const passwordMatch = await bcryptjs.compare(testPassword, adminUser.password)
      console.log('🔓 Password Test:', passwordMatch ? '✅ CORRECT' : '❌ INCORRECT')
    }

    // Check total user count
    const userCount = await prisma.user.count()
    console.log('👥 Total Users:', userCount)

  } catch (error) {
    console.error('❌ Error verifying admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdmin()