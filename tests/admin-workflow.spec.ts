import { test, expect } from '@playwright/test'

test.describe('Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin')
  })

  test('should display login form initially', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Admin Login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    page.on('dialog', dialog => dialog.accept())

    await page.click('button[type="submit"]')

    // The page should still show the login form
    await expect(page.locator('h1')).toContainText('Admin Login')
  })

  test('should login successfully and show dashboard', async ({ page }) => {
    // Mock successful login API response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', email: 'admin@example.com', name: 'Admin' }
        }),
        headers: {
          'Set-Cookie': 'auth-token=test-token; HttpOnly; Path=/'
        }
      })
    })

    // Mock stats API response
    await page.route('**/api/admin/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: {
            totalPosts: 5,
            activeGoals: 2,
            totalDonations: 150.50,
            monthlyDonations: 50.25
          }
        })
      })
    })

    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should show dashboard
    await expect(page.locator('h1')).toContainText('Admin Dashboard')
    await expect(page.locator('text=5')).toBeVisible() // Total posts
    await expect(page.locator('text=2')).toBeVisible() // Active goals
    await expect(page.locator('text=$150.50')).toBeVisible() // Total donations
    await expect(page.locator('text=$50.25')).toBeVisible() // Monthly donations
  })

  test('should navigate to goals management', async ({ page }) => {
    // Login first
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', email: 'admin@example.com' }
        })
      })
    })

    await page.route('**/api/admin/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: { totalPosts: 0, activeGoals: 0, totalDonations: 0, monthlyDonations: 0 }
        })
      })
    })

    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Click on Manage Goals
    await page.route('**/api/admin/goals', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ goals: [] })
      })
    })

    await page.click('text=Manage Goals')

    await expect(page.locator('h1')).toContainText('Manage Goals')
    await expect(page.locator('text=No goals created yet.')).toBeVisible()
  })

  test('should create a new goal', async ({ page }) => {
    // Mock login
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', email: 'admin@example.com' }
        })
      })
    })

    await page.route('**/api/admin/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: { totalPosts: 0, activeGoals: 0, totalDonations: 0, monthlyDonations: 0 }
        })
      })
    })

    // Login
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Navigate to create new goal
    await page.click('text=Create New Goal')

    await expect(page.locator('h1')).toContainText('Create New Goal')

    // Fill out goal form
    await page.fill('input[placeholder*="Bible Study"]', 'Test Ministry Goal')
    await page.fill('textarea[placeholder*="Describe"]', 'This is a test goal for ministry work')
    await page.fill('input[type="number"]', '500.00')
    await page.fill('input[type="date"]', '2024-12-31')

    // Mock create goal API
    await page.route('**/api/admin/goals', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: '1', title: 'Test Ministry Goal' })
        })
      }
    })

    page.on('dialog', dialog => dialog.accept())

    await page.click('button:has-text("Create Goal")')

    // Should show success and reset form
    await expect(page.locator('input[placeholder*="Bible Study"]')).toHaveValue('')
  })

  test('should handle logout', async ({ page }) => {
    // Login first
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', email: 'admin@example.com' }
        })
      })
    })

    await page.route('**/api/admin/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: { totalPosts: 0, activeGoals: 0, totalDonations: 0, monthlyDonations: 0 }
        })
      })
    })

    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Mock logout API
    await page.route('**/api/auth/logout', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logged out successfully' })
      })
    })

    // Click logout
    await page.click('button:has-text("Logout")')

    // Should return to login page
    await expect(page.locator('h1')).toContainText('Admin Login')
  })

  test('should show loading states', async ({ page }) => {
    // Mock slow login response
    await page.route('**/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', email: 'admin@example.com' }
        })
      })
    })

    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should show loading state
    await expect(page.locator('button:has-text("Signing in...")')).toBeVisible()
  })
})