import '@testing-library/jest-dom'

// Create mock functions that can be controlled from tests
const mockUseSession = jest.fn(() => ({ data: null, isPending: false }))
const mockSignInEmail = jest.fn()
const mockSignOut = jest.fn()
const mockSignInPasskey = jest.fn()

// Mock the better-auth client module
jest.mock('@/lib/better-auth-client', () => ({
  authClient: {
    signIn: {
      email: mockSignInEmail,
      passkey: mockSignInPasskey,
    },
    signOut: mockSignOut,
    passkey: {
      listUserPasskeys: jest.fn(),
      addPasskey: jest.fn(),
      deletePasskey: jest.fn(),
    },
  },
  useSession: mockUseSession,
  signIn: mockSignInEmail,
  signOut: mockSignOut,
}))

// Export mocks for test files to use
global.__mocks__ = {
  useSession: mockUseSession,
  signInEmail: mockSignInEmail,
  signOut: mockSignOut,
  signInPasskey: mockSignInPasskey,
}

// Mock better-auth/react for any direct imports
jest.mock('better-auth/react', () => ({
  createAuthClient: jest.fn(() => ({
    signIn: {
      email: mockSignInEmail,
      passkey: mockSignInPasskey,
    },
    signOut: mockSignOut,
    useSession: mockUseSession,
  })),
}))

jest.mock('@better-auth/passkey/client', () => ({
  passkeyClient: jest.fn(() => ({})),
}))

global.fetch = jest.fn()

beforeEach(() => {
  fetch.mockClear()
  mockUseSession.mockClear()
  mockSignInEmail.mockClear()
  mockSignOut.mockClear()
  mockSignInPasskey.mockClear()

  // Default mock implementations
  mockUseSession.mockReturnValue({ data: null, isPending: false })
  mockSignInEmail.mockResolvedValue({ data: null, error: null })
  mockSignOut.mockResolvedValue({ data: null, error: null })
})

// Only add window-related mocks for jsdom environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  // Silence navigation errors in jsdom
  const originalError = console.error
  console.error = (...args) => {
    if (args[0] && args[0].toString().includes('Not implemented: navigation')) {
      return
    }
    originalError.call(console, ...args)
  }
}

process.env.NODE_ENV = 'test'
process.env.BETTER_AUTH_SECRET = 'test-secret-key-that-is-at-least-32-characters-long'
process.env.BETTER_AUTH_URL = 'http://localhost:3000'
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb'

// Mock Prisma to avoid database connection issues in tests
jest.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    post: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    goal: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    donation: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    session: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
  },
}))

// Mock RBAC to avoid next/server Request import issues
jest.mock('@/lib/rbac', () => ({
  hasPermission: jest.fn(() => true),
  requirePermission: jest.fn(),
  checkPermissions: jest.fn(() => true),
  ADMIN_PERMISSIONS: [],
  DEVELOPER_PERMISSIONS: [],
  SUBSCRIBER_PERMISSIONS: [],
}))
