import { test, expect } from '@playwright/test'

test.describe('Basic Application Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/RealWorld/)
    
    // Check for main navigation elements
    await expect(page.locator('[data-testid="brand-logo"]')).toBeVisible()
    await expect(page.locator('[data-testid="home-link"]')).toBeVisible()
    
    // Check for hero section
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
    await expect(page.getByText('A place to share your knowledge')).toBeVisible()
    
    // Check for feed tabs
    await expect(page.locator('[data-testid="global-feed-tab"]')).toBeVisible()
    
    // Check for popular tags section
    await expect(page.locator('[data-testid="popular-tags"]')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    
    await page.click('[data-testid="login-link"]')
    
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Welcome back!')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/')
    
    await page.click('[data-testid="register-link"]')
    
    await expect(page).toHaveURL('/register')
    await expect(page.getByText('Join RealWorld')).toBeVisible()
    await expect(page.locator('[data-testid="username-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="register-button"]')).toBeVisible()
  })

  test('should show global feed by default', async ({ page }) => {
    await page.goto('/')
    
    // Global feed tab should be active
    await expect(page.locator('[data-testid="global-feed-tab"]')).toHaveAttribute('data-active', 'true')
    
    // Articles section should be visible
    await expect(page.locator('[data-testid="articles-section"]')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Check that main elements are still visible on mobile
    await expect(page.locator('[data-testid="brand-logo"]')).toBeVisible()
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
    await expect(page.locator('[data-testid="global-feed-tab"]')).toBeVisible()
  })

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page')
    
    // Should show 404 error or redirect to home
    const url = page.url()
    expect(url).toMatch(/(404|not-found|\/)/)
  })
})