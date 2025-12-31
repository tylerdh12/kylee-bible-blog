import '@testing-library/jest-dom'

// Mock better-auth client to avoid ESM issues in Jest
jest.mock('better-auth/react', () => ({
  createAuthClient: jest.fn(() => ({
    signIn: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn(() => ({ data: null, isPending: false })),
  })),
}))

jest.mock('@better-auth/passkey/client', () => ({
  passkeyClient: jest.fn(() => ({})),
}))

global.fetch = jest.fn()

beforeEach(() => {
  fetch.mockClear()
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
      return // Ignore navigation errors
    }
    originalError.call(console, ...args)
  }
}

process.env.NODE_ENV = 'test'
process.env.BETTER_AUTH_SECRET = 'test-secret-key-that-is-at-least-32-characters-long'
process.env.BETTER_AUTH_URL = 'http://localhost:3000'
// Legacy auth (still used by some tests)
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long'
// Database URL for tests (uses mock/fake connection)
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