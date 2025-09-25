import {
  createAuthToken,
  verifyAuthToken,
  getAuthTokenFromRequest
} from '@/lib/auth'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

jest.mock('jsonwebtoken')

const mockedJwt = jwt as jest.Mocked<typeof jwt>

describe('Auth Library', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createAuthToken', () => {
    it('creates JWT token with correct payload', () => {
      mockedJwt.sign.mockReturnValue('mock-token')

      const result = createAuthToken('user-123')

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { userId: 'user-123' },
        expect.any(String),
        { expiresIn: '7d' }
      )
      expect(result).toBe('mock-token')
    })
  })

  describe('verifyAuthToken', () => {
    it('verifies valid token', () => {
      const mockPayload = { userId: 'user-123' }
      mockedJwt.verify.mockReturnValue(mockPayload as any)

      const result = verifyAuthToken('valid-token')

      expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String))
      expect(result).toBe(mockPayload)
    })

    it('returns null for invalid token', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = verifyAuthToken('invalid-token')

      expect(result).toBe(null)
    })
  })

  describe('getAuthTokenFromRequest', () => {
    it('extracts token from request cookies', () => {
      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'auth-token-value' })
        }
      } as unknown as NextRequest

      const result = getAuthTokenFromRequest(mockRequest)

      expect(mockRequest.cookies.get).toHaveBeenCalledWith('auth-token')
      expect(result).toBe('auth-token-value')
    })

    it('returns null when no token in cookies', () => {
      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined)
        }
      } as unknown as NextRequest

      const result = getAuthTokenFromRequest(mockRequest)

      expect(result).toBe(null)
    })
  })
})