import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'

export async function POST(request: Request) {
  try {
    // Test database connection first
    try {
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please check your database configuration.' },
        { status: 503 }
      )
    }

    // Only allow this in development or if specifically enabled
    const isProduction = process.env.NODE_ENV === 'production'
    const allowSetup = process.env.ALLOW_ADMIN_SETUP?.trim()

    if (isProduction && allowSetup !== 'true') {
      return NextResponse.json(
        { error: 'Admin setup not allowed in production without ALLOW_ADMIN_SETUP=true' },
        { status: 403 }
      )
    }

    const { email, password, name, setupKey } = await request.json()

    // Configurable protection key with fallback
    const expectedSetupKey = process.env.ADMIN_SETUP_KEY || 'kylee-blog-setup-2024'
    if (setupKey !== expectedSetupKey) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      // Update password if different
      if (!existingAdmin.password) {
        // User exists but has no password (social login), set password
        const hashedPassword = await bcryptjs.hash(password, 12)
        await prisma.user.update({
          where: { email },
          data: { 
            password: hashedPassword,
            role: 'ADMIN' // Ensure admin role is set
          }
        })
        return NextResponse.json({
          success: true,
          message: 'Admin password set successfully!'
        })
      }

      const passwordMatch = await bcryptjs.compare(password, existingAdmin.password)
      if (!passwordMatch) {
        const hashedPassword = await bcryptjs.hash(password, 12)
        await prisma.user.update({
          where: { email },
          data: { 
            password: hashedPassword,
            role: 'ADMIN' // Ensure admin role is set
          }
        })
        return NextResponse.json({
          success: true,
          message: 'Admin password updated successfully!'
        })
      }
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists with correct password'
      })
    }

    // Create new admin user
    const hashedPassword = await bcryptjs.hash(password, 12)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      admin: { email, name }
    })

  } catch (error) {
    console.error('Admin setup error:', error)
    
    // Ensure database connection is cleaned up
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError)
    }
    
    return NextResponse.json(
      {
        error: 'Failed to set up admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    // Clean up database connection
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError)
    }
  }
}