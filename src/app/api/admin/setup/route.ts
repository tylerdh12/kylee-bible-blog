import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
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

    // Simple protection key
    if (setupKey !== 'kylee-blog-setup-2024') {
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
    console.log('Checking for existing admin with email:', email)
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })
    console.log('Existing admin found:', !!existingAdmin)

    if (existingAdmin) {
      // Update password if different
      const passwordMatch = await bcryptjs.compare(password, existingAdmin.password)
      if (!passwordMatch) {
        const hashedPassword = await bcryptjs.hash(password, 12)
        await prisma.user.update({
          where: { email },
          data: { password: hashedPassword }
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
    console.log('Creating new admin user with email:', email)
    const hashedPassword = await bcryptjs.hash(password, 12)

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'admin',
      },
    })
    console.log('Admin user created successfully:', newUser.id)

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      admin: { email, name }
    })

  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      {
        error: 'Failed to set up admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}