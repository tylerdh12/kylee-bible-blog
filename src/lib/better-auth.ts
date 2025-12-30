import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

const authSecret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "";

if (!authSecret && process.env.NODE_ENV === 'development') {
  console.warn("WARNING: BETTER_AUTH_SECRET is not set. Authentication may not work properly.");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  secret: authSecret,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Can enable later
    sendResetPassword: async ({ user, url, token }, request) => {
      // Import email utilities
      const { sendEmail, generatePasswordResetEmail } = await import('./utils/email');
      
      // Generate email content
      const { html, text } = generatePasswordResetEmail(url, user.name || undefined);
      
      // Send email
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password',
        html,
        text,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "SUBSCRIBER",
        input: false, // Admin sets this, not user during signup
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      avatar: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
      website: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
