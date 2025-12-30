/**
 * New Auth Utilities using Better Auth
 * 
 * This file provides compatibility functions that match the old auth API
 * but use better-auth under the hood. This allows gradual migration.
 */

import { auth } from "./better-auth";
import { headers } from "next/headers";
import { prisma } from "./db";

/**
 * Get the authenticated user from the current session
 * Compatible with old getAuthenticatedUser() API
 */
export async function getAuthenticatedUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    // Fetch full user with role and isActive
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatar: true,
        bio: true,
        website: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: (user.role as "ADMIN" | "DEVELOPER" | "SUBSCRIBER") || "SUBSCRIBER",
      isActive: user.isActive,
      avatar: user.avatar || user.image,
      bio: user.bio,
      website: user.website,
    };
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

/**
 * Create a new user (for admin use)
 * Compatible with old createUser() API
 */
export async function createUser(
  email: string,
  password: string,
  name?: string,
  role: "ADMIN" | "DEVELOPER" | "SUBSCRIBER" = "SUBSCRIBER"
) {
  try {
    // Use better-auth's signUp API
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || email.split("@")[0],
      },
    });

    if (!result?.user) {
      throw new Error("Failed to create user");
    }

    // Update user with role and custom fields
    const updatedUser = await prisma.user.update({
      where: { id: result.user.id },
      data: {
        role,
        isActive: true,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: (updatedUser.role as "ADMIN" | "DEVELOPER" | "SUBSCRIBER") || "SUBSCRIBER",
      isActive: updatedUser.isActive,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
      include: {
        accounts: {
          where: { providerId: 'credential' },
          take: 1,
        },
      },
  });

  if (!user) return null;

  // Get password from account
  const account = user.accounts[0];
  const password = account?.password || null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    password, // From Account table for better-auth
    role: (user.role as "ADMIN" | "DEVELOPER" | "SUBSCRIBER") || "SUBSCRIBER",
    isActive: user.isActive,
    avatar: user.avatar || user.image,
    bio: user.bio,
    website: user.website,
  };
}

/**
 * Verify password (for compatibility)
 * Note: Better-auth handles this internally, but we keep this for migration
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string | null
) {
  if (!hashedPassword) return false;
  
  // Better-auth uses bcrypt, so we can verify directly
  const bcrypt = require("bcryptjs");
  return bcrypt.compare(password, hashedPassword);
}

// Export better-auth instance for direct use
export { auth };
