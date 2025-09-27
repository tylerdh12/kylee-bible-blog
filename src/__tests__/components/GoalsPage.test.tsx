import { render, screen, waitFor } from '@testing-library/react'
import GoalsPage from '@/app/admin/goals/page'

// Mock Next.js navigation
const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/admin/goals',
}))


const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('GoalsPage', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('shows loading state initially', () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {}))

    render(<GoalsPage />)

    expect(screen.getByText('Loading goals...')).toBeInTheDocument()
  })

  it('displays empty state when no goals exist', async () => {
    // Mock auth check
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: true, user: { id: '1', name: 'Test User' } }),
    } as Response)

    // Mock goals fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ goals: [] }),
    } as Response)

    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByText('No goals created yet.')).toBeInTheDocument()
      expect(screen.getByText('Create Your First Goal')).toBeInTheDocument()
    })
  })

  it('displays goals when they exist', async () => {
    const mockGoals = [
      {
        id: '1',
        title: 'Bible Study Materials',
        description: 'Fund for new Bible study materials',
        targetAmount: 500,
        currentAmount: 200,
        completed: false,
        createdAt: '2024-01-01T00:00:00Z',
        donations: [{ id: '1', amount: 200 }]
      },
      {
        id: '2',
        title: 'Church Building Fund',
        description: 'Save for church expansion',
        targetAmount: 10000,
        currentAmount: 10000,
        completed: true,
        createdAt: '2024-01-15T00:00:00Z',
        deadline: '2024-12-31T00:00:00Z',
        donations: [
          { id: '2', amount: 5000 },
          { id: '3', amount: 5000 }
        ]
      }
    ]

    // Mock auth check
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: true, user: { id: '1', name: 'Test User' } }),
    } as Response)

    // Mock goals fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ goals: mockGoals }),
    } as Response)

    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByText('Bible Study Materials')).toBeInTheDocument()
      expect(screen.getByText('Fund for new Bible study materials')).toBeInTheDocument()
      expect(screen.getByText('$200.00 / $500.00')).toBeInTheDocument()
      expect(screen.getByText('40.0% complete')).toBeInTheDocument()

      expect(screen.getByText('Church Building Fund')).toBeInTheDocument()
      expect(screen.getByText('Save for church expansion')).toBeInTheDocument()
      expect(screen.getByText('$10000.00 / $10000.00')).toBeInTheDocument()
      expect(screen.getByText('100.0% complete')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()

      expect(screen.getByText('1 donation')).toBeInTheDocument()
      expect(screen.getByText('2 donations')).toBeInTheDocument()
    })
  })

  it('handles fetch error gracefully', async () => {
    // Mock auth check (successful)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: true, user: { id: '1', name: 'Test User' } }),
    } as Response)

    // Mock goals fetch (failed)
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByText('No goals created yet.')).toBeInTheDocument()
    })
  })

  it('displays page header and navigation', async () => {
    // Mock auth check
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: true, user: { id: '1', name: 'Test User' } }),
    } as Response)

    // Mock goals fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ goals: [] }),
    } as Response)

    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByText('Manage Goals')).toBeInTheDocument()
      expect(screen.getByText('Create New Goal')).toBeInTheDocument()
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument()
    })
  })

  it('calculates progress percentage correctly', async () => {
    const mockGoals = [
      {
        id: '1',
        title: 'Test Goal',
        targetAmount: 0,
        currentAmount: 100,
        completed: false,
        createdAt: '2024-01-01T00:00:00Z',
        donations: []
      }
    ]

    // Mock auth check
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: true, user: { id: '1', name: 'Test User' } }),
    } as Response)

    // Mock goals fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ goals: mockGoals }),
    } as Response)

    render(<GoalsPage />)

    await waitFor(() => {
      // Should handle division by zero
      expect(screen.getByText('0.0% complete')).toBeInTheDocument()
    })
  })
})