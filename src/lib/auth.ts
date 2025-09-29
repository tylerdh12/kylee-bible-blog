import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { DatabaseService } from './services/database'

// Lazy validation function for JWT_SECRET
function getValidatedJwtSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  if (JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security')
  }
  return JWT_SECRET
}

const db = DatabaseService.getInstance()

export async function createUser(email: string, password: string, name?: string, role: 'ADMIN' | 'DEVELOPER' | 'SUBSCRIBER' = 'SUBSCRIBER') {
  const hashedPassword = await bcryptjs.hash(password, 12)

  return db.createUser({
    email,
    password: hashedPassword,
    name: name || null,
    role,
    isActive: true,
    avatar: null,
    bio: null,
    website: null
  })
}

export async function verifyPassword(password: string, hashedPassword: string | null) {
  if (!hashedPassword) return false
  return bcryptjs.compare(password, hashedPassword)
}

export async function getUserByEmail(email: string) {
  return db.findUserByEmail(email)
}

export function createAuthToken(userId: string) {
  return jwt.sign({ userId }, getValidatedJwtSecret(), { expiresIn: '7d' })
}

export function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, getValidatedJwtSecret()) as { userId: string }
  } catch {
    return null
  }
}

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) return null

    const payload = verifyAuthToken(token)
    if (!payload) return null

    return db.findUserById(payload.userId)
  } catch {
    return null
  }
}

export function getAuthTokenFromRequest(request: NextRequest) {
  return request.cookies.get('auth-token')?.value || null
}