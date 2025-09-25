import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewGoalPage from '@/app/admin/goals/new/page'

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('NewGoalPage', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders create goal form', () => {
    render(<NewGoalPage />)

    expect(screen.getByText('Create New Goal')).toBeInTheDocument()
    expect(screen.getByLabelText('Goal Title *')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Target Amount * ($)')).toBeInTheDocument()
    expect(screen.getByLabelText('Deadline (Optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Goal' })).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<NewGoalPage />)

    const submitButton = screen.getByRole('button', { name: 'Create Goal' })
    await user.click(submitButton)

    expect(alertSpy).toHaveBeenCalledWith('Title and valid target amount are required')

    alertSpy.mockRestore()
  })

  it('validates target amount is positive', async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<NewGoalPage />)

    const titleInput = screen.getByLabelText('Goal Title *')
    const amountInput = screen.getByLabelText('Target Amount * ($)')
    const submitButton = screen.getByRole('button', { name: 'Create Goal' })

    await user.type(titleInput, 'Test Goal')
    await user.type(amountInput, '0')
    await user.click(submitButton)

    expect(alertSpy).toHaveBeenCalledWith('Title and valid target amount are required')

    alertSpy.mockRestore()
  })

  it('successfully creates a goal with all fields', async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1' }),
    } as Response)

    render(<NewGoalPage />)

    const titleInput = screen.getByLabelText('Goal Title *')
    const descriptionInput = screen.getByLabelText('Description')
    const amountInput = screen.getByLabelText('Target Amount * ($)')
    const deadlineInput = screen.getByLabelText('Deadline (Optional)')
    const submitButton = screen.getByRole('button', { name: 'Create Goal' })

    await user.type(titleInput, 'Bible Study Materials')
    await user.type(descriptionInput, 'Fund for new Bible study materials')
    await user.type(amountInput, '500.00')
    await user.type(deadlineInput, '2024-12-31')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Bible Study Materials',
          description: 'Fund for new Bible study materials',
          targetAmount: 500,
          deadline: '2024-12-31'
        }),
      })
    })

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Goal created successfully!')
    })

    // Form should be reset
    expect((titleInput as HTMLInputElement).value).toBe('')
    expect((descriptionInput as HTMLTextAreaElement).value).toBe('')
    expect((amountInput as HTMLInputElement).value).toBe('')
    expect((deadlineInput as HTMLInputElement).value).toBe('')

    alertSpy.mockRestore()
  })

  it('successfully creates a goal with minimal fields', async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1' }),
    } as Response)

    render(<NewGoalPage />)

    const titleInput = screen.getByLabelText('Goal Title *')
    const amountInput = screen.getByLabelText('Target Amount * ($)')
    const submitButton = screen.getByRole('button', { name: 'Create Goal' })

    await user.type(titleInput, 'Simple Goal')
    await user.type(amountInput, '100')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Simple Goal',
          description: null,
          targetAmount: 100,
          deadline: null
        }),
      })
    })

    alertSpy.mockRestore()
  })

  it('handles API errors', async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response)

    render(<NewGoalPage />)

    const titleInput = screen.getByLabelText('Goal Title *')
    const amountInput = screen.getByLabelText('Target Amount * ($)')
    const submitButton = screen.getByRole('button', { name: 'Create Goal' })

    await user.type(titleInput, 'Test Goal')
    await user.type(amountInput, '100')
    await user.click(submitButton)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to create goal')
    })

    alertSpy.mockRestore()
  })

  it('handles network errors', async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<NewGoalPage />)

    const titleInput = screen.getByLabelText('Goal Title *')
    const amountInput = screen.getByLabelText('Target Amount * ($)')
    const submitButton = screen.getByRole('button', { name: 'Create Goal' })

    await user.type(titleInput, 'Test Goal')
    await user.type(amountInput, '100')
    await user.click(submitButton)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error creating goal')
    })

    alertSpy.mockRestore()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()

    mockFetch.mockImplementationOnce(() => new Promise(() => {})) // Never resolves

    render(<NewGoalPage />)

    const titleInput = screen.getByLabelText('Goal Title *')
    const amountInput = screen.getByLabelText('Target Amount * ($)')
    const submitButton = screen.getByRole('button', { name: 'Create Goal' })

    await user.type(titleInput, 'Test Goal')
    await user.type(amountInput, '100')
    await user.click(submitButton)

    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})