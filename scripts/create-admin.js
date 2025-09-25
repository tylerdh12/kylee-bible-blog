const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')

const prisma = new PrismaClient()

async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst()
    if (existingAdmin) {
      console.log('Admin user already exists!')
      return
    }

    // Create default admin
    const hashedPassword = await bcryptjs.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'kylee@blog.com',
        password: hashedPassword,
        name: 'Kylee',
        role: 'admin',
      },
    })

    console.log('✅ Default admin user created successfully!')
    console.log('📧 Email: kylee@blog.com')
    console.log('🔐 Password: admin123')
    console.log('⚠️  Please change this password after first login!')
    
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultAdmin()