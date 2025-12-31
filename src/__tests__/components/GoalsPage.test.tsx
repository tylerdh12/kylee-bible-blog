import { render, screen } from '@testing-library/react'
import GoalsListClient from '@/app/admin/goals/goals-list-client'
import type { Goal } from '@/types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/admin/goals',
}))

// Mock the useCurrency hook
jest.mock('@/hooks/use-currency', () => ({
  useCurrency: () => ({
    formatAmount: (amount: number) => `$${amount.toFixed(2)}`,
    currency: 'USD',
    setCurrency: jest.fn(),
  }),
}))

describe('GoalsListClient', () => {
  const mockGoals: Goal[] = [
    {
      id: '1',
      title: 'Bible Study Materials',
      description: 'Fund for new Bible study materials',
      targetAmount: 500,
      currentAmount: 200,
      completed: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deadline: null,
      donations: [{ id: '1', amount: 200, goalId: '1', createdAt: '2024-01-01T00:00:00Z' }],
    },
    {
      id: '2',
      title: 'Church Building Fund',
      description: 'Save for church expansion',
      targetAmount: 10000,
      currentAmount: 10000,
      completed: true,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      deadline: '2024-12-31T00:00:00Z',
      donations: [
        { id: '2', amount: 5000, goalId: '2', createdAt: '2024-01-10T00:00:00Z' },
        { id: '3', amount: 5000, goalId: '2', createdAt: '2024-01-15T00:00:00Z' },
      ],
    },
  ]

  it('displays empty state when no goals exist', () => {
    render(<GoalsListClient goals={[]} />)

    expect(screen.getByText('No goals yet')).toBeInTheDocument()
    expect(screen.getByText('Create Your First Goal')).toBeInTheDocument()
  })

  it('displays goals when they exist', () => {
    render(<GoalsListClient goals={mockGoals} />)

    expect(screen.getByText('Bible Study Materials')).toBeInTheDocument()
    expect(screen.getByText('Fund for new Bible study materials')).toBeInTheDocument()

    expect(screen.getByText('Church Building Fund')).toBeInTheDocument()
    expect(screen.getByText('Save for church expansion')).toBeInTheDocument()
  })

  it('shows completed badge for completed goals', () => {
    render(<GoalsListClient goals={mockGoals} />)

    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('displays page header with New Goal button', () => {
    render(<GoalsListClient goals={[]} />)

    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Manage your ministry goals')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /new goal/i })).toBeInTheDocument()
  })

  it('shows goal progress information', () => {
    render(<GoalsListClient goals={mockGoals} />)

    // Check for amount displays
    expect(screen.getByText(/\$200\.00/)).toBeInTheDocument()
    expect(screen.getByText(/\$500\.00/)).toBeInTheDocument()
  })

  it('shows donation counts for goals', () => {
    render(<GoalsListClient goals={mockGoals} />)

    expect(screen.getByText('1 donation')).toBeInTheDocument()
    expect(screen.getByText('2 donations')).toBeInTheDocument()
  })

  it('displays edit buttons for each goal', () => {
    render(<GoalsListClient goals={mockGoals} />)

    const editLinks = screen.getAllByRole('link', { name: /edit/i })
    expect(editLinks).toHaveLength(2)
  })
})
