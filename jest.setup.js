import '@testing-library/jest-dom'

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
process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long'