import bcryptjs from 'bcryptjs'
import { prisma } from './db'

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await bcryptjs.hash(password, 12)
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcryptjs.compare(password, hashedPassword)
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}