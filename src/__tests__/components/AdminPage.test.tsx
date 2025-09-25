import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminPage from '@/app/admin/page'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('AdminPage', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockPush.mockClear()
  })

  describe('Loading state', () => {
    it('shows loading spinner when checking auth status', async () => {
      mockFetch.mockImplementationOnce(() =>
        new Promise(() => {}) // Never resolves
      )

      render(<AdminPage />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Login form', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: false }),
      } as Response)
    })

    it('renders login form when user is not authenticated', async () => {
      render(<AdminPage />)

      await waitFor(() => {
        expect(screen.getByText('Admin Login')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
      })
    })

    it('handles successful login', async () => {
      const user = userEvent.setup()

      render(<AdminPage />)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })

      await user.type(emailInput, 'admin@example.com')
      await user.type(passwordInput, 'password123')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: '1', email: 'admin@example.com' } }),
      } as Response)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stats: { totalPosts: 5, activeGoals: 2, totalDonations: 150, monthlyDonations: 50 }
        }),
      } as Response)

      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })
    })

    it('handles login failure', async () => {
      const user = userEvent.setup()
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

      render(<AdminPage />)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })

      await user.type(emailInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpass')

      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      await user.click(submitButton)

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Invalid credentials')
      })

      alertSpy.mockRestore()
    })
  })

  describe('Dashboard', () => {
    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            authenticated: true,
            user: { id: '1', email: 'admin@example.com', name: 'Admin' }
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            stats: { totalPosts: 10, activeGoals: 3, totalDonations: 500, monthlyDonations: 150 }
          }),
        } as Response)
    })

    it('renders dashboard with stats when authenticated', async () => {
      render(<AdminPage />)

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument() // totalPosts
        expect(screen.getByText('3')).toBeInTheDocument() // activeGoals
        expect(screen.getByText('$500.00')).toBeInTheDocument() // totalDonations
        expect(screen.getByText('$150.00')).toBeInTheDocument() // monthlyDonations
      })
    })

    it('has working logout functionality', async () => {
      const user = userEvent.setup()

      render(<AdminPage />)

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })

      const logoutButton = screen.getByRole('button', { name: 'Logout' })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response)

      await user.click(logoutButton)

      await waitFor(() => {
        expect(screen.getByText('Admin Login')).toBeInTheDocument()
      })
    })

    it('displays quick action buttons', async () => {
      render(<AdminPage />)

      await waitFor(() => {
        expect(screen.getByText('Create New Post')).toBeInTheDocument()
        expect(screen.getByText('Create New Goal')).toBeInTheDocument()
        expect(screen.getByText('View Donations')).toBeInTheDocument()
        expect(screen.getByText('Manage Goals')).toBeInTheDocument()
      })
    })
  })
})