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
}

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret'